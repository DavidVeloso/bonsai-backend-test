import { connect, Connection } from "mongoose"
import * as dotenv from "dotenv"
import MovieModel from "../../source/entities/Movie"
import TicketModel from "../../source/entities/Ticket"
import { logger } from "../../source/config/logger"

dotenv.config()

let dbConnection: Connection | null

export const connectTestDb = async (): Promise<void> => {
  try {
    const { DATABASE_TEST_URI } = process.env
    if (!dbConnection) {
      const { connection } = await connect(<string>DATABASE_TEST_URI, { useNewUrlParser: true, useCreateIndex: true })
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