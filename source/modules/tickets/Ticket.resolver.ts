import { Arg, Mutation, Query, Resolver } from "type-graphql"

import { logger } from "../../config/logger"
import MovieModel from "../../entities/Movie"
import TicketModel, { Ticket } from "../../entities/Ticket"
import { syncTicketsService } from '../../services/ticket.service'

import { 
  AddTicketInput, 
  ListTicketsInput, 
  SyncTicketsInput,
  TicketInput,
  TicketPaginateResult,
  TicketWithoutMovie,
} from "./Ticket.input"

@Resolver(() => Ticket)
export class TicketResolver {

  @Query(() => Ticket, { nullable: true })
  public async ticket(@Arg("input") ticketInput: TicketInput): Promise<Ticket> {
    const ticket = await TicketModel.findById(ticketInput.id).populate('movie')
    if (!ticket) throw new Error("No ticket found!")
    return ticket
  }

  @Query(() => TicketPaginateResult)
  public async listTickets(@Arg("input") input: ListTicketsInput): Promise<TicketPaginateResult> {
    const { limit, offset, cursorDate, sortDate} = input
    const query = cursorDate ? { date: { $lt: new Date(cursorDate) }} : {}
    const options = { limit, offset, populate: 'movie', sort: { date: sortDate}}
    return TicketModel.paginate(query, options)
  }

  @Query(() => TicketPaginateResult)
  public async ticketsWithoutMovie(@Arg("input") input: TicketWithoutMovie): Promise<TicketPaginateResult> {
    const { limit, offset } = input
    const query = { movie: null}
    const options = { limit, offset }
    return TicketModel.paginate(query, options)
  }

  @Mutation(() => Ticket)
  public async addTicket(@Arg("input") ticketInput: AddTicketInput): Promise<Ticket> {
    const ticket = new TicketModel(ticketInput)
    return ticket.saveFields()
  }
  
  @Mutation(() => String)
  public async syncTickets(@Arg("input") syncInput: SyncTicketsInput): Promise<string> {
    try {
      await TicketModel.deleteMany({})
      await MovieModel.deleteMany({})
      syncTicketsService(syncInput)
      return 'Tickets sync started! You can query while we store the data.'
    } catch (error) {
      logger.error('Error syncTickets: ', error)
      throw error
    }
  }
}
