import { imdbValidResponse } from "../_utils/data/movie"
import { connectTestDb, clearDb, closeDb } from "../_utils/database"
import { graphqlConnection } from "../_utils/graphql"
import MovieModel from "../../source/entities/Movie"

describe('Movie Resolver', () => {
  let createdMovie: any

  beforeAll(async () => {
    await connectTestDb()
    await clearDb()
    createdMovie = await MovieModel.create(imdbValidResponse)
  })

  afterAll(async () => {
    await clearDb()
    await closeDb()
  })

  afterEach(async () => {
    await jest.clearAllMocks()
  })
  
  describe('movie', () => {
    it('Should find and return a movie by id', async () => {
      const spyMovieModel = jest.spyOn(MovieModel, 'findById')
      const movieQuery = `
        query movieQuery($id: ObjectId!){
          movie(input:{id:$id}){
            _id
            Title
            Genre
            Language
            Ratings {
              Source
              Value
            }
          }
        }
      `
      const queryResponse = await graphqlConnection(movieQuery, { id: createdMovie._id})
      // Current workaround to [Object: null prototype]: { data } problem
      const parsedResponse = JSON.parse(JSON.stringify(queryResponse))
      const { movie } = parsedResponse.data
      expect(movie._id).toBeDefined()
      expect(movie.Title).toBeDefined()
      expect(movie.Title).toEqual(createdMovie.Title)
      expect(movie.Genre).toBeDefined()
      expect(movie.Genre.length).toEqual(1)
      expect(movie.Language).toBeDefined()
      expect(movie.Ratings).toBeDefined()
      expect(movie.Ratings.length).toBeGreaterThanOrEqual(1)
      expect(movie.Ratings[0].Source).toBeDefined()
      expect(movie.Ratings[0].Value).toBeDefined()
      expect(spyMovieModel).toHaveBeenCalledTimes(1)
    })

    it('Movie not found', async () => {
      const spyMovieModel = jest.spyOn(MovieModel, 'findById')
      const movieQuery = `
        query movieQuery($id: ObjectId!){
          movie(input:{id:$id}){
            _id
            Title
            Genre
          }
        }
      `
      const queryResponse = await graphqlConnection(movieQuery, { id: "4b8701a4fc13ae6569000392"})
      const parsedResponse = JSON.parse(JSON.stringify(queryResponse))
      const {data, errors} = parsedResponse
      expect(errors.length).toEqual(1)
      expect(errors[0].message).toEqual('No movie found!')
      expect(data.movie).toEqual(null)
      expect(spyMovieModel).toHaveBeenCalledTimes(1)
    })
  })

  describe('listMovies', () => {
    it('Should return list of movies', async () => {
      const listMovies = `
        query listMovies($limit: Int!, $offset: Int!){
          listMovies(input:{limit:$limit, offset:$offset}){
            totalDocs
            limit
            offset
            docs {
              _id
              Title
              Poster
              imdbID
            }
          }
        }
      `
      const queryResponse = await graphqlConnection(listMovies, { limit:10, offset:0 })
      const parsedResponse = JSON.parse(JSON.stringify(queryResponse))
      const data = parsedResponse.data.listMovies  
      expect(data.limit).toBeDefined()
      expect(data.limit).toEqual(10)
      expect(data.offset).toBeDefined()
      expect(data.offset).toEqual(0)
      expect(data.totalDocs).toBeDefined()
      expect(data.totalDocs).toBeGreaterThanOrEqual(1)
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThanOrEqual(1)
      expect(data.docs[0]._id).toBeDefined()
      expect(data.docs[0].Title).toBeDefined()
      expect(data.docs[0].Poster).toBeDefined()
      expect(data.docs[0].imdbID).toBeDefined()
    })
  })

})