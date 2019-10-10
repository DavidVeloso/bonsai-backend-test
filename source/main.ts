import { ApolloServer } from "apollo-server"
import { ObjectId } from "mongodb"
import { connect } from "mongoose"
import * as dotenv from "dotenv"
import * as path from "path"
import "reflect-metadata"
import { buildSchema } from "type-graphql"

import { ObjectIdScalar } from "./objectId.scalar"
import resolvers from "./modules"
import typegooseMiddleware from "./typegooseMiddleware"

dotenv.config()

const {SERVER_PORT, DATABASE_URI} = process.env

const main = async () => {
  try {
    await connect(<string>DATABASE_URI, { useNewUrlParser: true } )
  } catch (mongoConnectError) {
    console.error(mongoConnectError)
  }
  try {
    const schema = await buildSchema({
      resolvers,
      emitSchemaFile: path.resolve(__dirname, "schema.gql"),
      globalMiddlewares: [typegooseMiddleware],
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    })
    const server = new ApolloServer({ schema, context: {} })
    const { url } = await server.listen(SERVER_PORT)
    console.log(`GraphQL Playground running at ${url}`)
  } catch (apolloError) {
    console.error(apolloError)
  }
}

main()
