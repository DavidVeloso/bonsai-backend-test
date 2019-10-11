import axios from "axios"

import { SyncTicketsInput, AddTicketInput } from "../modules/tickets/Ticket.input"
import MovieModel, { Movie } from "../entities/movie"
import TicketModel, { Ticket } from "../entities/ticket"
import transformGenres from '../helpers/transformGenres'

const syncTicketsService = async (syncInput: SyncTicketsInput) => {
  try {
    const { maxTicketsToSync } = syncInput
    const { data: tickets } = await getTickets(maxTicketsToSync)
    const validTickets = tickets.filter((ticket: Ticket) => ticket.title && ticket.title !== '')

    return Promise.all(validTickets.map(async(ticket: Ticket) => { 
      const formatedTicket = formatTicket(ticket)
      const movieInfo = await imdbMovieInfo(ticket.title)
    
      if(movieInfo.Response === 'True'){
        const existsMovie = await MovieModel.findOne({ imdbID: movieInfo.imdbID })
        if(existsMovie){
          formatedTicket.movie = existsMovie._id
        }else {
          const createdMovie = await MovieModel.create(movieInfo)
          formatedTicket.movie = createdMovie._id
        }      
      }
    
      await new TicketModel(formatedTicket).saveFields()
    }))
  } catch (error) {
    console.log('--> Error SyncTicketsService: ', error)
  }
}

const getTickets = (maxTicketsToSync:number) => {
  const { BONSAI_MOVIES_TICKETS_URL } = process.env
  const skip = 0
  const ticketsUri = `${BONSAI_MOVIES_TICKETS_URL}?skip=${skip}&limit=${maxTicketsToSync}`
  return axios.get(ticketsUri)
} 

const formatTicket = (ticket: any): AddTicketInput => {
  const { _id, title, genre, image, price, date, inventory } = ticket
  return { 
    imageUrl: image, 
    originId: _id['$oid'], 
    genre: transformGenres(genre, '|'),
    title, price, date, inventory
  }
}

const imdbMovieInfo = async (movieName:string) => {
  try {
    const { OMDB_API_URL, OMDB_API_KEY } = process.env
    const cleanedName = cleanMovieName(movieName)
    const uri = `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&t=${cleanedName}`
    const {data: movieInfo} = await axios.get(uri)
    return movieInfo
  } catch (error) {
    console.log('--> Erro IMDB Search: ', error)
  }
}

const cleanMovieName = (movieName:string) => {
  const lowerCaseAndTrim = movieName.toLowerCase().trim()
  const removeBrackets = lowerCaseAndTrim.replace(/\(.*\)/, '')
  const noTheExpression = removeBrackets.replace(', the', '')
  const noAExpression = removeBrackets.replace(', a', '')
  const encodedName = encodeURIComponent(noAExpression)
  return encodedName
}

export default syncTicketsService