import { ObjectId } from "mongodb"
import { Field, Float, Int, ObjectType } from "type-graphql"
import paginate from 'mongoose-paginate-v2'

import { Movie } from "./movie"
import { Ref, PaginateResult} from '../types'

import {
  arrayProp as ArrayProperty,
  instanceMethod as InstanceMethod,
  InstanceType,
  prop as Property,
  plugin,
  staticMethod as StaticMethod,
  Typegoose
} from "typegoose"

@plugin(paginate)
@ObjectType()
export class Ticket extends Typegoose {

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

  @Field()
  public imageUrl: string

  @Field()
  @Property({ required: true })
  public date: Date
  
  @Field(() => Movie, {nullable: true})
  @Property({ ref: Movie })
  public movie: Ref<Movie>

  @Field()
  @Property({ required: true })
  public originId: ObjectId

  @InstanceMethod
  public saveFields(this: InstanceType<Ticket>) {
    // Inventory should always be at least 0
    this.inventory = Math.max(this.inventory || 0, 0)
    return this.save()
  }
  
  // Implement pagitate method
  static paginate: (query: any, options: any) => Promise<PaginateResult<Ticket>>
}

export const TicketModel = new Ticket().getModelForClass(Ticket)

export default TicketModel
