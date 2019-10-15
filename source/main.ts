import { ApolloServer } from "apollo-server"
import * as dotenv from "dotenv"
import * as path from "path"
import "reflect-metadata"

import { connectDb } from "./config/database"
import { logger } from "./config/logger"
import { graphqlSchema } from './graphqlSchema'

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
const envPath = path.resolve(`${__dirname}/../${envFile}`)

dotenv.config({ path: envPath })

const {SERVER_PORT, DATABASE_URI} = process.env

const main = async () => {
  try {
    await connectDb(DATABASE_URI as string)
    const schema = await graphqlSchema()
    const server = new ApolloServer({ schema, context: {} })
    const { url } = await server.listen(SERVER_PORT)
    logger.info(`GraphQL Playground running at ${url}`)
  } catch (apolloError) {
    logger.error('Error Connect Apollo Server: ', apolloError)
  }
}

main()
