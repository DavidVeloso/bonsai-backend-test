import { Arg, Mutation, Query, Resolver } from "type-graphql"
import TicketModel, { Ticket } from "../../entities/Ticket"
import syncTicketsService from '../../services/ticket.service'
import { logger } from "../../config/logger"

import { 
  AddTicketInput, 
  ListTicketsInput, 
  TicketInput,
  TicketWithoutMovie,
  TicketPaginateResult,
  SyncTicketsInput
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
    return await TicketModel.paginate(query, options)
  }

  @Query(() => TicketPaginateResult)
  public async ticketsWithoutMovie(@Arg("input") input: TicketWithoutMovie): Promise<TicketPaginateResult> {
    const { limit, offset } = input
    const query = { movie: null}
    const options = { limit, offset }
    return await TicketModel.paginate(query, options)
  }

  @Mutation(() => Ticket)
  public async addTicket(@Arg("input") ticketInput: AddTicketInput): Promise<Ticket> {
    const ticket = new TicketModel(ticketInput)
    return ticket.saveFields()
  }
  
  @Mutation(() => String)
  public async syncTickets(@Arg("input") syncInput: SyncTicketsInput): Promise<String> {
    try {
      await TicketModel.deleteMany({})
      syncTicketsService(syncInput)
      return 'Tickets sync started! You can query while we store the data.'
    } catch (error) {
      logger.error('Error syncTickets: ', error)
      throw error
    }
  }
}
