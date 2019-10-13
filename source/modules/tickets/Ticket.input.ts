import { ObjectId } from "mongodb"
import { Field, Float, InputType, Int, ObjectType } from "type-graphql"
import { Max, IsIn } from "class-validator"
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
  @Field(() => Date, {nullable: true})
  public cursorDate?: Date
  
  // # used to sort cursor (-1 Desc 1 ASC)
  @Field(() => Int, {defaultValue: -1})
  @IsIn([-1, 1])
  public sortDate?: number

  @Field(() => Int, { defaultValue: 20 })
  @Max(100)
  public limit?: number

  @Field(() => Int, { defaultValue: 0 })
  public offset?: number
}

@InputType()
export class SyncTicketsInput {
  @Field(() => Int, { defaultValue: 100 })
  @Max(1000)
  public maxTicketsToSync: number
}

@InputType()
export class TicketWithoutMovie {
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
  public originId?: ObjectId

  @Field()
  public movie?: ObjectId
}
