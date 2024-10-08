import mongoose from 'mongoose'
import { app } from './app'

const start = async () => {
  console.log('Starting up....')
  try {
    /*
      type guard for process.env.JWT_KEY
      in start function rather than route file
      so that error is caught right at app start
    */
    if (!process.env.JWT_KEY) {
      throw new Error('JWT_KEY not defined')
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not defined')
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log('Connected to auth DB')
  } catch (err) {
    console.error(err)
  }
  app.listen(3000, () => console.log(`Auth service listening on port 3000`))
}

start()
