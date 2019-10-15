import axios, { AxiosResponse }from "axios"
import { validTickets, ticketWithoutMatchMovie} from "../_utils/data/ticket"
import { imdbValidResponse, imdbNotFoundResponse } from "../_utils/data/movie"
import { connectTestDb, clearDb, closeDb } from "../_utils/database"
import TicketModel, {Ticket} from "../../source/entities/Ticket"
import MovieModel from "../../source/entities/Movie"
import { 
  cleanMovieName, 
  imdbMovieInfo, 
  resolveSearchParams,
  syncTicketMovieInfo 
} from "../../source/services/movie.service"

describe('Movie Service', () => {
  let createdTickets: Ticket[]
  let createdTicketsWithotMovie: Ticket[]
  let createdTicketsLen: number
  let createdTicketsWithotMovieLen: number

  beforeAll(async () => {
    await connectTestDb()
    await clearDb()
    createdTickets = await TicketModel.insertMany(validTickets)
    createdTicketsWithotMovie = await TicketModel.insertMany(ticketWithoutMatchMovie)
    createdTicketsLen = createdTickets.length
    createdTicketsWithotMovieLen = createdTicketsWithotMovie.length
  })

  afterAll(async () => {
    await closeDb()
  })
  
  describe('cleanMovieName', () => {
    it('Should clean movie name strings and encodeUri', async () => {
      const lowerCaseAndTrim = cleanMovieName('    MOVIE TITLE TEST   ')
      const removeBrackets = cleanMovieName('La casa de Papel (A casa de papel)  ')
      const noTheExpression = cleanMovieName('   Avengers, The   ')
      const noAExpression = cleanMovieName('   Xifurinfula, a')
      const encodeString = cleanMovieName('o auto da compadecida')
      expect(lowerCaseAndTrim).toEqual('movie%20title%20test')
      expect(removeBrackets).toEqual('la%20casa%20de%20papel')
      expect(noTheExpression).toEqual('avengers')
      expect(noAExpression).toEqual('xifurinfula')
      expect(encodeString).toEqual('o%20auto%20da%20compadecida')
      expect(cleanMovieName("")).toEqual("")
    })
  })

  describe('imdbMovieInfo', () => {
    const spyAxios = jest.spyOn(axios, 'get')
    const { OMDB_API_URL } = process.env
    
    afterEach(async () => {
      spyAxios.mockClear()
    })

    it('Should fetch movie info from imdb api', async () => {
      spyAxios.mockResolvedValueOnce({ data: imdbValidResponse } as AxiosResponse)
      const ticket = createdTickets[0]
      const movieInfo = await imdbMovieInfo(ticket)
      expect(movieInfo.Title).toBeDefined()
      expect(movieInfo.imdbID).toBeDefined()
      expect(movieInfo.Plot).toBeDefined()
      expect(movieInfo.Response).toEqual('True')
      expect(spyAxios).toHaveBeenCalledWith(OMDB_API_URL, { params: resolveSearchParams(ticket) })
      expect(spyAxios).toHaveBeenCalledTimes(1)
    })

    it('Not found movie info', async () => {
      spyAxios.mockResolvedValueOnce({ data: imdbNotFoundResponse } as AxiosResponse)
      const tw = createdTicketsWithotMovie[0]
      const movieInfo = await imdbMovieInfo(tw)
      expect(movieInfo.Response).toEqual('False')
      expect(movieInfo.Error).toEqual('Movie not found!')  
      expect(spyAxios).toHaveBeenCalledWith(OMDB_API_URL, { params: resolveSearchParams(tw)})
      expect(spyAxios).toHaveBeenCalledTimes(1)
    })
  })

  describe('syncTicketMovieInfo', () => {
    const spyAxios = jest.spyOn(axios, 'get')
    const spyCreateMovie = jest.spyOn(MovieModel, 'create')
    const spyFindTickets = jest.spyOn(TicketModel, 'find')
    const spyFindOneMovie = jest.spyOn(MovieModel, 'findOne')

    afterEach(async () => {
      spyAxios.mockClear()
      spyCreateMovie.mockClear()
      spyFindTickets.mockClear()
      spyFindOneMovie.mockClear()
    })

    it('Should sync tickets movies', async () => {
      for (const t in createdTickets) {
        spyAxios.mockResolvedValueOnce({ data: imdbValidResponse } as AxiosResponse)
      }
      for (const t in createdTicketsWithotMovie) {
        spyAxios.mockResolvedValueOnce({ data: imdbNotFoundResponse } as AxiosResponse)
      }

      const countMoviesBef = await MovieModel.countDocuments({})
      expect(countMoviesBef).toEqual(0)

      await syncTicketMovieInfo()
      
      expect(spyFindTickets).toHaveBeenCalledTimes(1)
      expect(spyAxios).toHaveBeenCalled()
      expect(spyFindOneMovie).toHaveBeenCalledTimes(createdTicketsLen)
      expect(spyCreateMovie).toHaveBeenCalledTimes(createdTicketsLen)

      const countMoviesAft = await MovieModel.countDocuments({})
      const tWithoutMovie = await TicketModel.find({ movie: null })

      expect(countMoviesAft).toEqual(createdTicketsLen)
      expect(tWithoutMovie.length).toEqual(createdTicketsWithotMovieLen)

      tWithoutMovie.forEach(t => {
        expect(t.syncMovieTries).toBeGreaterThanOrEqual(1)
      })
    })

  })

})