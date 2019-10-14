import axios from "axios"
import { validTickets, ticketWithoutMatchMovie} from "../_utils/data/ticket"
import { connectTestDb, clearDb, closeDb } from "../_utils/database"
import TicketModel, {Ticket} from "../../source/entities/Ticket"
import MovieModel from "../../source/entities/movie"
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

    it('Should fetch movies info from imdb api', async () => {
      for (let i = 0; i < createdTicketsLen; i++) {
        const t = createdTickets[i]
        const movieInfo = await imdbMovieInfo(t)
        expect(movieInfo.Title).toBeDefined()
        expect(movieInfo.imdbID).toBeDefined()
        expect(movieInfo.Plot).toBeDefined()
        expect(movieInfo.Response).toEqual('True')
        expect(spyAxios).toHaveBeenCalledWith(OMDB_API_URL, { params: resolveSearchParams(t) })

      }
      expect(spyAxios).toHaveBeenCalledTimes(createdTicketsLen)
    })

    it('Not found movies infos', async () => {
      for (let i = 0; i < createdTicketsWithotMovieLen; i++) {
        const tw = createdTicketsWithotMovie[i]
        const movieInfo = await imdbMovieInfo(tw)
        expect(movieInfo.Response).toEqual('False')
        expect(movieInfo.Error).toEqual('Movie not found!')  
        expect(spyAxios).toHaveBeenCalledWith(OMDB_API_URL, { params: resolveSearchParams(tw)})
      }
      expect(spyAxios).toHaveBeenCalledTimes(createdTicketsWithotMovieLen)
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
      const countMoviesBef = await MovieModel.countDocuments({})
      expect(countMoviesBef).toEqual(0)
      
      await syncTicketMovieInfo()
      
      expect(spyFindTickets).toHaveBeenCalledTimes(1)
      expect(spyAxios).toHaveBeenCalledTimes(createdTicketsLen + createdTicketsWithotMovieLen)
      expect(spyFindOneMovie).toHaveBeenCalledTimes(createdTicketsLen)
      expect(spyCreateMovie).toHaveBeenCalledTimes(createdTicketsLen)

      const countMoviesAft = await MovieModel.countDocuments({})
      const tWithoutMovie = await TicketModel.find({ movie: null })

      expect(countMoviesAft).toEqual(createdTicketsLen)
      expect(tWithoutMovie.length).toEqual(createdTicketsWithotMovieLen)

      tWithoutMovie.forEach(t => {
        expect(t.syncMovieTries).toBeGreaterThanOrEqual(1)
        expect(t.syncMovieLastError).toEqual('Movie not found!')
      })
    })

  })

})