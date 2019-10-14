import { ApolloServer } from "apollo-server"
import { ObjectId } from "mongodb"
import * as dotenv from "dotenv"
import * as path from "path"
import "reflect-metadata"
import { buildSchema } from "type-graphql"

import { connectDb } from "./config/database"
import { ObjectIdScalar } from "./objectId.scalar"
import resolvers from "./modules"
import typegooseMiddleware from "./middlewares/typegoose.middleware"
import { logger } from "./config/logger"

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
const envPath = path.resolve(`${__dirname}/../${envFile}`)

dotenv.config({ path: envPath })

const {SERVER_PORT, DATABASE_URI} = process.env

const main = async () => {
  try {
    await connectDb(<string>DATABASE_URI)
    const schema = await buildSchema({
      resolvers,
      emitSchemaFile: path.resolve(__dirname, "schema.gql"),
      globalMiddlewares: [typegooseMiddleware],
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    })
    const server = new ApolloServer({ schema, context: {} })
    const { url } = await server.listen(SERVER_PORT)
    logger.info(`GraphQL Playground running at ${url}`)
  } catch (apolloError) {
    logger.error('Error Connect Apollo Server: ', apolloError)
  }
}

main()
