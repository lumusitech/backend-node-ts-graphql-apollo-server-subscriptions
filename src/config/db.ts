import mongoose from 'mongoose'

export const runDb = () => {
  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then(() => {
      console.log('📣 connected to MongoDB')
    })
    .catch(error => {
      console.log('error connecting to MongoDB:', error.message)
    })
}
