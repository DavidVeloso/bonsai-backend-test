import { ObjectId } from "mongodb"
import paginate from 'mongoose-paginate-v2'
import { Field, Float, Int, ObjectType } from "type-graphql"
import {
  arrayProp as ArrayProperty,
  instanceMethod as InstanceMethod,
  InstanceType,
  plugin,
  prop as Property,
  Typegoose
} from "typegoose"

import { PaginateResult, Ref } from '../types'

import { Movie } from "./Movie"

@plugin(paginate)
@ObjectType()
export class Ticket extends Typegoose {
  
  // Implement pagitate method
  public static paginate: (query: any, options: any) => Promise<PaginateResult<Ticket>>

  @Field()
  public readonly _id: ObjectId

  @Field()
  @Property({ required: true })
  public title: string

  @Field(() => [String])
  @ArrayProperty({ items: String, default: [] })
  public genre: string[]

  @Field(() => Float)
  @Property({ required: true })
  public price: number

  @Field(() => Int)
  @Property({ required: true })
  public inventory: number

  @Field(() => String)
  @Property({ required: false })
  public imageUrl: string

  @Field()
  @Property({ required: true })
  public date: Date
  
  @Field(() => Movie, {nullable: true})
  @Property({ ref: Movie })
  public movie: Ref<Movie>

  @Field(() => String, {nullable: true})
  @Property({ required: false })
  public originId: string

  @Field(() => Int)
  @Property({default: 0})
  public syncMovieTries: number

  @Field(() => String)
  @Property({required: false})
  public syncMovieLastError: string

  @InstanceMethod
  public saveFields(this: InstanceType<Ticket>) {
    // Inventory should always be at least 0
    this.inventory = Math.max(this.inventory || 0, 0)
    return this.save()
  }
  
}

export const TicketModel = new Ticket().getModelForClass(Ticket)

export default TicketModel
