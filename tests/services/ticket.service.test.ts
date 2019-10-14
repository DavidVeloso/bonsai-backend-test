import axios, { AxiosResponse }from "axios"
import { connectTestDb, clearDb, closeDb } from "../_utils/database"
import { bonsaiValidTicketsResponse, bonsaiInValidTicketsResponse } from "../_utils/data/ticket"
import {  getTickets, isValidTicket, formatTicket } from "../../source/services/ticket.service"

describe('Ticket Service', () => {
  const spyAxios = jest.spyOn(axios, 'get')
  const { BONSAI_MOVIES_TICKETS_URL } = process.env

  beforeAll(async () => {
    await connectTestDb()
    await clearDb()
  })

  afterAll(async () => {
    await clearDb()
    await closeDb()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTickets', () => {
    it('Should fetch tickets from api', async () => {
      spyAxios.mockResolvedValueOnce({ data: bonsaiValidTicketsResponse } as AxiosResponse)
      const {data: tickets} = await getTickets(100, 0)
      expect(tickets).toHaveLength(bonsaiValidTicketsResponse.length)
      expect(spyAxios).toHaveBeenCalledTimes(1)
      expect(tickets[0]._id).toBeDefined()
      expect(tickets[0].title).toBeDefined()
      expect(tickets[0].genre).toBeDefined()
      expect(tickets[0].price).toBeDefined()
      expect(tickets[0].inventory).toBeDefined()
      expect(tickets[0].image).toBeDefined()
      expect(tickets[0].date).toBeDefined()
      expect(spyAxios).toHaveBeenCalledWith(`${BONSAI_MOVIES_TICKETS_URL}?skip=0&limit=100`)
    })
  })
  
  describe('isValidTicket', () => {
    it('Should return if is a valid ticket', async () => {
      bonsaiInValidTicketsResponse.forEach(t => expect(isValidTicket(t)).toEqual(false))
      bonsaiValidTicketsResponse.forEach(t => expect(isValidTicket(t)).toEqual(true))
    })
  })

  describe('formatTicket', () => {
    it('Should clean and format tickets from bonsai api', async () => {
      spyAxios.mockResolvedValueOnce({ data: bonsaiValidTicketsResponse } as AxiosResponse)
      bonsaiValidTicketsResponse.forEach(t => {
        const forted = formatTicket(t)
        expect(forted.imageUrl).toBeDefined()
        expect(forted.originId).toBeDefined()
        expect(forted.genre.length).toBeGreaterThanOrEqual(1)
        expect(forted.inventory).toBeGreaterThanOrEqual(0)
      })
    })
  })
})