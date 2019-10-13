import axios from "axios"
import MovieModel, { Movie } from "../entities/movie"
import TicketModel, { Ticket } from "../entities/ticket"

// TO-DICUSS: we can call this function in one cronjob to scheduled syncs
const syncTicketMovieInfo = async (limit:number = 100, skip:number = 0): Promise<void> => {
  console.log('Sync movies started.')

  // Retrieve tickets without movie info and with a specific number off sync attempts
  const ticketsWithoutMovie = await TicketModel.find({ 
    movie: null,
    syncMovieTries: { "$lte": 3 }
  }).sort({ syncMovieTries: 1 }).skip(skip).limit(limit)

  // Parallel for performance
  Promise.all(ticketsWithoutMovie.map(async (ticket) => {
  
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

const imdbMovieInfo = async (ticket:Ticket) => {
  try {
    // TO-DICUSS
    // - Save on db params used before to chech and avoid the same error
    // - Improve syncMovieTries to use diferent functions based on numbers
    const { title } = ticket
    const { OMDB_API_URL, OMDB_API_KEY } = process.env
    
    let searchParams: any = { apikey: OMDB_API_KEY }

    // Check and use the number of sync attempts 
    // to use different search formats.
    if(ticket.syncMovieTries === 0){
      searchParams.t = cleanMovieName(title)
    } else if(ticket.syncMovieTries === 1) {
      searchParams.t = title
    } else {
      const ticketYear = new Date(ticket.date).getFullYear()
      searchParams.t = cleanMovieName(title)
      searchParams.y = ticketYear
    }

    const {data: movieInfo} = await axios.get(<string>OMDB_API_URL, { params: searchParams})
    return movieInfo
  } catch (error) {
    console.log('--> Erro IMDB Search: ', error.respose.data)
  }
}

// Clean movie title basead on manual attempts
// TO-DICUSS: Study different approaches to clean and use title combinations
// Possible approaches:
//   - Use only name in Brackets
//   - If has ', the' ou ', a' try use expression on string start
const cleanMovieName = (movieName:string): string => {
  const lowerCaseAndTrim = movieName.toLowerCase().trim() // Lower case and remover blank spaces
  const removeBrackets = lowerCaseAndTrim.replace(/\(.*\)/, '') // Remove Brackets (ex: 'Heirloom, The (Zhai Ban)' -> 'Heirloom, The')
  const noTheExpression = removeBrackets.replace(', the', '') // Remove ',t he' (ex: 'Heirloom, The' -> 'Heirloom')
  const noAExpression = noTheExpression.replace(', a', '') // Remove ', a' (ex: 'Heirloom, a' -> 'Heirloom')
  const encodedName = encodeURIComponent(noAExpression) // Encode string to escape caracters
  return encodedName
}

export {
  syncTicketMovieInfo,
  imdbMovieInfo,
  cleanMovieName
}