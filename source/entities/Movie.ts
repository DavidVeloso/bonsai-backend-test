import { ObjectId } from "mongodb"
import { Field, ObjectType } from "type-graphql"
import paginate from 'mongoose-paginate-v2'

import { PaginateResult } from '../types'

import {
  arrayProp as ArrayProperty,
  prop as Property,
  plugin,
  Typegoose,
} from "typegoose"

@ObjectType()
class Rating {
  @Field()
  Value: string

  @Field()
  Source: string
}

@plugin(paginate)
@ObjectType()
export class Movie extends Typegoose {
  
  @Field()
  public readonly _id: ObjectId

  @Field()
  @Property({ required: true })
  public Title: string

  @Field()
  @Property()
  public Year: string

  @Field()
  @Property()
  public Rated: string

  @Field()
  @Property()
  public Released: string

  @Field()
  @Property()
  public Runtime: string

  @Field(() => [String])
  @ArrayProperty({ items: String, default: [] })
  public Genre: string[]

  @Field()
  @Property()
  public Director: string

  @Field()
  @Property()
  public Writer: string

  @Field(() => [String])
  @ArrayProperty({ items: String, default: [] })
  public Actors: string[]

  @Field()
  @Property()
  public Plot: string

  @Field(() => [String])
  @ArrayProperty({ items: String, default: [] })
  public Language: string[]

  @Field()
  @Property()
  public Country: string

  @Field()
  @Property()
  public Awards: string

  @Field()
  @Property()
  public Poster: string

  @Field(type => [Rating])
  @ArrayProperty({ items: Rating, default: [] })
  public Ratings: Rating[]

  @Field()
  @Property()
  public Metascore: string

  @Field()
  @Property()
  public imdbRating: string

  @Field()
  @Property()
  public imdbVotes: string

  @Field()
  @Property({index:true})
  public imdbID: string

  @Field()
  @Property()
  public Production: string

  // Implement pagitate method
  static paginate: (query: any, options: any) => Promise<PaginateResult<Movie>>
}

export const MovieModel = new Movie().getModelForClass(Movie)

export default MovieModel
