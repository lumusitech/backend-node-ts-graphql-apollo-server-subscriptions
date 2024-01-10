import { Schema, model } from 'mongoose'

const schema = new Schema({
  name: String,
  endDate: String,
})

export default model('Comment', schema)
