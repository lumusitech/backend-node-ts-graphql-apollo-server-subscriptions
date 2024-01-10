import dotenv from 'dotenv'
import { runDb } from './config/db.js'
import { runServer } from './presentation/server.js'

dotenv.config()

runDb()
runServer()
