import { connect } from 'mongoose'
import { logger } from './logger'

// Open a new connection to a Mongo database
export async function connectDb(databaseUrl: string): Promise<void> {
  let dbConectRetries = 5
  try {
    while (dbConectRetries){
      await connect(databaseUrl, { useNewUrlParser: true, useCreateIndex: true  })
      logger.info('Database Connected!') 
      break
    }
  } catch (mongoConnectError) {
    dbConectRetries -= 1
    logger.error('--> Error on connect Database: ', mongoConnectError.message )
    logger.info(`Retries left: ${dbConectRetries}`)
    await new Promise(res => setTimeout(res, 5000))
  }
}
