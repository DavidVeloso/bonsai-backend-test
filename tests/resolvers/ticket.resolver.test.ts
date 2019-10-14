import { validTickets, createTicketWithMovie, ticketsWithoutMatchMovie} from "../_utils/data/ticket"
import { connectTestDb, clearDb, closeDb } from "../_utils/database"
import { graphqlConnection } from "../_utils/graphql"
import TicketModel from "../../source/entities/Ticket"

describe('Ticket Resolver', () => {
  let ticketWithMovie: any

  beforeAll(async () => {
    await connectTestDb()
    await clearDb()
    ticketWithMovie = await createTicketWithMovie()
    await TicketModel.insertMany(ticketsWithoutMatchMovie)
    await TicketModel.insertMany(validTickets)
  })

  afterAll(async () => {
    await clearDb()
    await closeDb()
  })

  afterEach(async () => {
    await jest.clearAllMocks()
  })
  
  describe('ticket', () => {
    it('Should find and return a ticket by id', async () => {
      const spyTicketModel = jest.spyOn(TicketModel, 'findById')
      const ticketQuery = `
        query ticketQuery($id: ObjectId!){
          ticket(input:{id:$id}){
            _id
            title
            date
            movie {
              _id
              Title
            }
          }
        }
      `
      const queryResponse = await graphqlConnection(ticketQuery, { id: ticketWithMovie._id})
      // Current workaround to [Object: null prototype]: { data } problem
      const ticketResponse = JSON.parse(JSON.stringify(queryResponse))
      const ticketData = ticketResponse.data.ticket
      expect(ticketData._id).toBeDefined()
      expect(ticketData.title).toBeDefined()
      expect(ticketData.title).toEqual(ticketWithMovie.title)
      expect(ticketData.date).toBeDefined()
      expect(ticketData.movie).toBeDefined()
      expect(ticketData.movie._id).toBeDefined()
      expect(ticketData.movie.Title).toBeDefined()
      expect(spyTicketModel).toHaveBeenCalledTimes(1)
    })

    it('Ticket not found', async () => {
      const spyTicketModel = jest.spyOn(TicketModel, 'findById')
      const ticketQuery = `
        query ticketQuery($id: ObjectId!){
          ticket(input:{id:$id}){
            _id
            title
            date
            movie {
              _id
              Title
            }
          }
        }
      `
      const queryResponse = await graphqlConnection(ticketQuery, { id: "4b8701a4fc13ae6569000392"})
      const ticketResponse = JSON.parse(JSON.stringify(queryResponse))
      const {data, errors} = ticketResponse
      expect(errors.length).toEqual(1)
      expect(errors[0].message).toEqual('No ticket found!')
      expect(data.ticket).toEqual(null)
    })
  })

  describe('ticketsWithoutMovie', () => {
    it('Should return tickets without match movie', async () => {
      const ticketsWithoutMovie = `
        query ticketsWithoutMovie($limit: Int!, $offset: Int!){
          ticketsWithoutMovie(input:{limit:$limit, offset:$offset}){
            totalDocs
            limit
            offset
            docs {
              _id
              title
              date
            }
          }
        }
      `
      const queryResponse = await graphqlConnection(ticketsWithoutMovie, { limit:10, offset:0 })
      const parsedResponse = JSON.parse(JSON.stringify(queryResponse))
      const data = parsedResponse.data.ticketsWithoutMovie  
      expect(data.limit).toBeDefined()
      expect(data.limit).toEqual(10)
      expect(data.offset).toBeDefined()
      expect(data.offset).toEqual(0)
      expect(data.totalDocs).toBeDefined()
      expect(data.totalDocs).toBeGreaterThanOrEqual(1)
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThanOrEqual(1)
      expect(data.docs[0]._id).toBeDefined()
      expect(data.docs[0].title).toBeDefined()
      expect(data.docs[0].date).toBeDefined()
    })
  })

  describe('listTickets', () => {
    it('Should return list of tickets', async () => {
      const listTickets = `
        query listTickets($limit: Int!, $offset: Int!){
          listTickets(input:{limit:$limit, offset:$offset}){
            totalDocs
            limit
            offset
            docs {
              _id
              title
              date
              movie {
                _id
                Title
              }
            }
          }
        }
      `
      const queryResponse = await graphqlConnection(listTickets, { limit:100, offset:0 })
      // Current workaround to [Object: null prototype]: { data } problem
      const parsedResponse = JSON.parse(JSON.stringify(queryResponse))
      const data = parsedResponse.data.listTickets  
      expect(data.limit).toBeDefined()
      expect(data.limit).toEqual(100)
      expect(data.offset).toBeDefined()
      expect(data.offset).toEqual(0)
      expect(data.totalDocs).toBeDefined()
      expect(data.totalDocs).toBeGreaterThanOrEqual(1)
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThanOrEqual(1)
      expect(data.docs[0]._id).toBeDefined()
      expect(data.docs[0].title).toBeDefined()
      expect(data.docs[0].date).toBeDefined()
      expect(data.docs[0].movie).toBeDefined()
    })

    it('Should return list of tickets using cursor', async () => {
      const listTickets = `
        query listTickets($limit: Int!, $offset: Int!, $cursorDate: DateTime!){
          listTickets(input:{limit:$limit, offset:$offset, cursorDate:$cursorDate}){
            totalDocs
            limit
            offset
            docs {
              _id
              title
              date
              movie {
                _id
                Title
              }
            }
          }
        }
      `
      const cursorDate = new Date('2018-10-10')
      const queryResponse = await graphqlConnection(listTickets, { limit:100, offset:0 , cursorDate})
      const parsedResponse = JSON.parse(JSON.stringify(queryResponse))
      const data = parsedResponse.data.listTickets  
      expect(data.limit).toBeDefined()
      expect(data.limit).toEqual(100)
      expect(data.offset).toBeDefined()
      expect(data.offset).toEqual(0)
      expect(data.totalDocs).toBeDefined()
      expect(data.totalDocs).toBeGreaterThanOrEqual(1)
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThanOrEqual(1)
      expect(data.docs[0]._id).toBeDefined()
      expect(data.docs[0].title).toBeDefined()
      expect(data.docs[0].date).toBeDefined()
      expect(new Date(data.docs[0].date).getTime()).toBeLessThan(cursorDate.getTime())
      expect(new Date(data.docs[1].date).getTime()).toBeLessThan(new Date(data.docs[0].date).getTime())
    })
  })
  
  describe('addTicket', () => {
    it('Should return list of tickets', async () => {
      const addTicket = `
        mutation addTicket($input: AddTicketInput!){
          addTicket(input:$input){
            _id
            title
            date
          }
        }
      `
      const mutationResponse = await graphqlConnection(addTicket, { input: {
        "title": "Jairo The Vaca",
        "date": new Date("2018-06-04T08:18:44.000Z"),
        "imageUrl": "http://dummyimage.com/1763x1520.png/5fa2dd/ffffff",
        "originId": "5b8701a4fc13ae6569000392",
        "inventory": 4,
        "genre": ["Action"],
        "price": 28.236
      }})
      const parsedResponse = JSON.parse(JSON.stringify(mutationResponse))
      const data = parsedResponse.data.addTicket  
      expect(data._id).toBeDefined()
      expect(data.title).toBeDefined()
      expect(data.date).toBeDefined()
    })
  })
})