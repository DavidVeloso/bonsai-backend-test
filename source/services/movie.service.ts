import axios from "axios"
import MovieModel from "../entities/Movie"
import TicketModel, { Ticket } from "../entities/Ticket"
import { logger } from "../config/logger"

// TO-DISCUSS: we can call this function in one cronjob to scheduled Ssyncs
const syncTicketMovieInfo = async (limit:number = 100, skip:number = 0): Promise<void[]> => {
  
  // Retrieve tickets without movie info and with a specific number off sync attempts
  const ticketsWithoutMovie = await TicketModel.find({ 
    movie: null,
    syncMovieTries: { "$lte": 3 }
  }).sort({ syncMovieTries: 1 }).skip(skip).limit(limit)
  
  // Parallel for performance
  return Promise.all(ticketsWithoutMovie.map(async (ticket) => {
    const movieInfo = await imdbMovieInfo(ticket)
    let movieId

    if(movieInfo.Response === 'True'){
      // Check if exists movie info to avoid duplicate movies
      const hasMovie = await MovieModel.findOne({ imdbID: movieInfo.imdbID })
      if(hasMovie){
        movieId = hasMovie._id 
      } else {
        const newMovie = await MovieModel.create(movieInfo)
        movieId = newMovie._id
      }      
    } else {
      ticket.syncMovieLastError = movieInfo.Error // keep error message to measure what is happened
    }
  
    ticket.syncMovieTries++
    ticket.movie = movieId
    await ticket.save()
  }))
}

// Fetch movie info from IMDB API
const imdbMovieInfo = async (ticket:Ticket) => {
  try {
    const { OMDB_API_URL } = process.env
    const searchParams = resolveSearchParams(ticket) 
    const {data: movieInfo} = await axios.get(<string>OMDB_API_URL, { params: searchParams})
    return movieInfo
  } catch (error) {
    logger.error('Erro IMDB Search: ', error.response.data || error.message)
  }
}

const resolveSearchParams = (ticket:Ticket) => {
  // TO-DISCUSS:
  // - Save past params on db to check and avoid the same error
  // - Use 'syncMovieTries' and 'syncMovieLastError' to use different approaches
  // - Search by Year does not work, tickets date are so different...
  const { title, syncMovieTries} = ticket
  const { OMDB_API_KEY } = process.env
  const searchParams: any = { apikey: OMDB_API_KEY }

  // Check and use the number of sync attempts to try different search params.
  if(syncMovieTries === 1){
    searchParams.t = title
  } else{
    searchParams.t = cleanMovieName(title)
  }

  return searchParams
}

// Clean movie title based on manual attempts
// TO-DISCUSS: Study different approaches to clean and use title combinaStions
// Possible approaches:
//   - Use only name in Brackets
//   - If input has ', the' or ', a' try use expression on string start
const cleanMovieName = (movieName:string): string => {
  const lowerCase = movieName.toLowerCase() // Lower case
  const removeBrackets = lowerCase.replace(/\(.*\)/, '') // Remove Brackets (ex: 'Heirloom, The (Zhai Ban)' -> 'Heirloom, The')
  const noTheExpression = removeBrackets.replace(', the', '') // Remove ',t he' (ex: 'Heirloom, The' -> 'Heirloom')
  const noAExpression = noTheExpression.replace(', a', '') // Remove ', a' (ex: 'Heirloom, a' -> 'Heirloom')
  const trim = noAExpression.trim() // Remove blank spaces
  const encodedName = encodeURI(trim) // Encode string to escape caracters
  return encodedName
}

export {
  syncTicketMovieInfo,
  imdbMovieInfo,
  resolveSearchParams,
  cleanMovieName
}