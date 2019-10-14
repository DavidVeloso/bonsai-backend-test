import axios from "axios"

import { SyncTicketsInput, AddTicketInput } from "../modules/tickets/Ticket.input"
import TicketModel, { Ticket } from "../entities/ticket"
import transformGenres from '../helpers/transformGenres'
import { syncTicketMovieInfo } from './movie.service'
import { logger } from "../config/logger"

const syncTicketsService = async (syncInput: SyncTicketsInput) => {
  try {
    const { limitPageSync } = syncInput
    storeTickets(limitPageSync, 0)
  } catch (error) {
    logger.error('Error SyncTicketsService: ', error)
  }
}

const getTickets = (limitPageSync:number, skip = 0) => {
  try {
    const { BONSAI_MOVIES_TICKETS_URL } = process.env
    const ticketsUri = `${BONSAI_MOVIES_TICKETS_URL}?skip=${skip}&limit=${limitPageSync}`
    return axios.get(ticketsUri)
  } catch (error) {
    logger.error('Error on get tickets from api: ', error)
    throw error
  }
}

const storeTickets = async (limit: number, skip: number): Promise<void> => {
  const {data: tickets} = await getTickets(limit, skip)
  
  // Remove tickets without required information and format ticket
  const validTickets: AddTicketInput[] = tickets.filter(validateTicketInput).map(formatTicket)
  
  // Recursively get and store tickets
  if(validTickets && validTickets.length){
    await TicketModel.insertMany(validTickets)
    syncTicketMovieInfo(limit) // Sync movie info after insert tickets using limitPageSync as limit
    return storeTickets(limit, skip + limit)
  }
}

// Check ticked required information
const validateTicketInput = (ticket: Ticket): Boolean => {
  const { title, date } = ticket
  if(!title && title === '') return false
  if(!date) return false
  return true
}

// Normalize ticket data
const formatTicket = (ticket: any): AddTicketInput => {
  const { _id, title, genre, image, price, date, inventory } = ticket
  return { 
    imageUrl: image || '', 
    originId: _id['$oid'], // keep original ticket id for possible use in future
    genre: transformGenres(genre, '|'),
    inventory: Math.max(inventory || 0, 0),
    title, price, date
  }
}

export default syncTicketsService