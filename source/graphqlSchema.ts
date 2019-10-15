import { ObjectId } from "mongodb"
import * as path from "path"
import { buildSchema } from "type-graphql"

import typegooseMiddleware from "./middlewares/typegoose.middleware"
import resolvers from "./modules"
import { ObjectIdScalar } from "./objectId.scalar"

export const graphqlSchema = async () => {
  return buildSchema({
    resolvers,
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    globalMiddlewares: [typegooseMiddleware],
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  })
}