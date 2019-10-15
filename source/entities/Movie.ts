import { ObjectId } from "mongodb"
import paginate from 'mongoose-paginate-v2'
import { Field, ObjectType } from "type-graphql"
import {
  arrayProp as ArrayProperty,
  plugin,
  prop as Property,
  Typegoose,
} from "typegoose"

import { PaginateResult } from '../types'

@ObjectType()
class Rating {
  @Field()
  public Value: string

  @Field()
  public Source: string
}

@plugin(paginate)
@ObjectType()
export class Movie extends Typegoose {
  
  // Implement pagitate method
  public static paginate: (query: any, options: any) => Promise<PaginateResult<Movie>>

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
}

export const MovieModel = new Movie().getModelForClass(Movie)

export default MovieModel
