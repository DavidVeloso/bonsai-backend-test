import { ObjectId } from "mongodb"
import * as path from "path"
import { buildSchema } from "type-graphql"
import { ObjectIdScalar } from "./objectId.scalar"
import resolvers from "./modules"
import typegooseMiddleware from "./middlewares/typegoose.middleware"

export const graphqlSchema = async () => {
  return await buildSchema({
    resolvers,
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    globalMiddlewares: [typegooseMiddleware],
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  })
}