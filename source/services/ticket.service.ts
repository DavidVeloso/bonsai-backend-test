import axios from "axios"

import { logger } from "../config/logger"
import TicketModel from "../entities/Ticket"
import transformGenres from '../helpers/transformGenres'
import { AddTicketInput, SyncTicketsInput } from "../modules/tickets/Ticket.input"

import { syncTicketMovieInfo } from './movie.service'

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
  const validTickets: AddTicketInput[] = tickets.filter(isValidTicket).map(formatTicket)
  
  // Recursively get and store tickets
  if(validTickets && validTickets.length){
    await TicketModel.insertMany(validTickets)
    syncTicketMovieInfo(limit) // Sync movie info after insert tickets using limitPageSync as limit
    return storeTickets(limit, skip + limit)
  }
}

// Check ticked required information
const isValidTicket = (ticket: any): boolean => {
  const { title, date } = ticket
  if(!title || title === '') return false
  if(!date || date === '') return false
  return true
}

// Normalize ticket data
const formatTicket = (ticket: any): AddTicketInput => {
  const { _id, title, genre, image, price, date, inventory } = ticket
  const { $oid: originId } = _id
  return { 
    imageUrl: image || '', 
    genre: transformGenres(genre, '|'),
    inventory: Math.max(inventory || 0, 0),
    originId, // keep original ticket id for possible use in future
    title, price, date
  }
}

export {
  syncTicketsService,
  getTickets,
  storeTickets,
  isValidTicket,
  formatTicket
}