import { Arg, Mutation, Query, Resolver } from "type-graphql"

import TicketModel, { Ticket } from "../../entities/ticket"
import syncTicketsService from '../../services/syncTickets'

import { 
  AddTicketInput, 
  ListTicketsInput, 
  TicketInput,
  SyncTicketsInput
} from "./Ticket.input"

@Resolver(() => Ticket)
export class TicketResolver {
  @Query(() => Ticket, { nullable: true })
  public async ticket(@Arg("input") ticketInput: TicketInput): Promise<Ticket> {
    const ticket = await TicketModel.findById(ticketInput.id)
    if (!ticket) {
      throw new Error("No ticket found!")
    }
    return ticket
  }

  @Query(() => [Ticket])
  public async listTickets(@Arg("input") input: ListTicketsInput): Promise<Ticket[]> {
    const tickets = await TicketModel.find({})
    const result = tickets
      .filter(ticket => ticket.date.getTime() < input.cursor.getTime())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, input.limit)
    return result
  }

  @Mutation(() => Ticket)
  public async addTicket(@Arg("input") ticketInput: AddTicketInput): Promise<Ticket> {
    const ticket = new TicketModel(ticketInput)
    return ticket.saveFields()
  }
  
  @Mutation(() => String)
  public async syncTickets(@Arg("input") syncInput: SyncTicketsInput): Promise<String> {
    syncTicketsService(syncInput)
    return 'Tickets sync started!'
  }
}
