import { ObjectId } from "mongodb"
import { Field, Float, Int, ObjectType } from "type-graphql"
import { Movie } from "./movie"
import { Ref } from '../types'

import {
  arrayProp as ArrayProperty,
  instanceMethod as InstanceMethod,
  InstanceType,
  prop as Property,
  Typegoose,
} from "typegoose"

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
}

export const TicketModel = new Ticket().getModelForClass(Ticket)

export default TicketModel
