import { ObjectId } from "mongodb"
import { Field, InputType, Int, ObjectType } from "type-graphql"
import { Max } from "class-validator"
import { Movie } from '../../entities/movie'

@InputType()
export class MovieInput {
  @Field()
  public id: ObjectId
}

@InputType()
export class MovieList {
  @Field(() => Int, { defaultValue: 20 })
  @Max(100)
  public limit: number

  @Field(() => Int, { defaultValue: 0 })
  public offset: number
}

@ObjectType()
export class MoviePaginateResult {
  @Field(() => [Movie])
  public docs: [Movie]
  @Field(() => Int)
  public totalDocs: number
  @Field(() => Int)
  public limit: number
  @Field(() => Int)
  public offset: number
}

