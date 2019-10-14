import { connect, Connection } from "mongoose"
import * as dotenv from "dotenv"
import MovieModel from "../../source/entities/Movie"
import TicketModel from "../../source/entities/Ticket"
import { logger } from "../../source/config/logger"
import path from 'path'

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
const envPath = path.resolve(`${__dirname}/../../${envFile}`)

dotenv.config({ path: envPath })

let dbConnection: Connection | null

export const connectTestDb = async (): Promise<void> => {
  try {
    const { DATABASE_URI } = process.env
    if (!dbConnection) {
      const { connection } = await connect(<string>DATABASE_URI, { useNewUrlParser: true, useCreateIndex: true })
      dbConnection = connection;
    }
  } catch (mongoConnectError) {
    logger.error('-> Error on connect TestDB: ', mongoConnectError.message) 
   throw mongoConnectError
  }
}

export const closeDb = async (): Promise<void> => {
  if (dbConnection) {
    await dbConnection.close()
    dbConnection = null
  }
}

export const clearDb = async (): Promise<void> => {
  await TicketModel.deleteMany({})
  await MovieModel.deleteMany({})
}