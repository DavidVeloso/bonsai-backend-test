import { ObjectId } from "mongodb"
import { Field, Float, InputType, Int, ObjectType } from "type-graphql"
import { Max } from "class-validator"
import { Ticket } from '../../entities/ticket'

@ObjectType()
export class TicketPaginateResult {
  @Field(() => [Ticket])
  public docs: [Ticket]
  @Field(() => Int)
  public totalDocs: number
  @Field(() => Int)
  public limit: number
  @Field(() => Int)
  public offset: number
}

@InputType()
export class TicketInput {
  @Field()
  public id: ObjectId
}

@InputType()
export class ListTicketsInput {
  @Field(() => Date)
  public cursor: Date

  @Field(() => Int)
  public limit: number
}

@InputType()
export class SyncTicketsInput {
  @Field(() => Int, { defaultValue: 100 })
  @Max(1000)
  public maxTicketsToSync: number
}

@InputType()
export class TicketWithoutMatch {
  @Field(() => Int, { defaultValue: 20 })
  @Max(100)
  public limit: number

  @Field(() => Int, { defaultValue: 0 })
  public offset: number
}

@InputType()
export class AddTicketInput implements Partial<Ticket> {
  @Field()
  public title: string

  @Field(() => [String])
  public genre: string[]

  @Field(() => Float)
  public price: number

  @Field(() => Int)
  public inventory: number

  @Field()
  public imageUrl?: string

  @Field()
  public date: Date

  @Field()
  public originId: ObjectId

  @Field()
  public movie?: ObjectId
}
