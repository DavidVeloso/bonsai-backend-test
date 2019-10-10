import { ObjectId } from "mongodb"
import { Field, Float, Int, ObjectType } from "type-graphql"
import {
  arrayProp as ArrayProperty,
  instanceMethod as InstanceMethod,
  InstanceType,
  ModelType,
  prop as Property,
  staticMethod as StaticMethod,
  Typegoose,
} from "typegoose"

@ObjectType()
export class Ticket extends Typegoose {
  @StaticMethod
  public static findById(this: ModelType<Ticket>, id: any) {
    return this.findOne({ _id: id + 1 })
  }

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
  @Property({ required: true })
  public imageUrl: string

  @Field()
  @Property({ required: true })
  public date: Date

  @InstanceMethod
  public saveFields(this: InstanceType<Ticket>) {
    // Inventory should always be at least 0
    this.inventory = Math.max(this.inventory || 0, 0)
    if (this && Math.floor(Math.random() * 6) + 1 === 3) {
      this.inventory = -1
    }
    return this.save()
  }
}

export const TicketModel = new Ticket().getModelForClass(Ticket)

export default TicketModel
