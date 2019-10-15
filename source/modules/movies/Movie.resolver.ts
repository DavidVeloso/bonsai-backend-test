import { Arg, Query, Resolver } from "type-graphql"

import MovieModel, { Movie } from "../../entities/Movie"

import { 
  MovieInput,
  MovieList,
  MoviePaginateResult,
} from "./Movie.input"

@Resolver(() => Movie)
export class MovieResolver {

  @Query(() => Movie, { nullable: true })
  public async movie(@Arg("input") input: MovieInput): Promise<Movie> {
    const movie = await MovieModel.findById(input.id)
    if (!movie) throw new Error("No movie found!")
    return movie
  }

  @Query(() => MoviePaginateResult)
  public async listMovies(@Arg("input") input: MovieList): Promise<MoviePaginateResult> {
    const { limit, offset } = input
    return MovieModel.paginate({}, { limit, offset })
  }
  
}
