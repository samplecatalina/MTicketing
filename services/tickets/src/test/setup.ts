import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

/*
  to tell TypeScript about global signup function,
  augment type definition
*/
declare global {
  namespace NodeJS {
    interface Global {
      signup(email?: string): string[]
    }
  }
}

jest.mock('../kafkaWrapper.ts')

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'qwert'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  // clear DB
  //@ts-ignore
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

// close connection and stop DB
afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

/*
  globally scoped function for easier use
  only available in test env
*/
global.signup = (email = 'samplecatalina@test.com') => {
  // Create fake cookie
  // Build a JWT payload & create the JWT
  const token = jwt.sign(
    { email, id: new mongoose.Types.ObjectId().toHexString() },
    process.env.JWT_KEY!
  )

  // Build session Object as JSON
  const sessionJSON = JSON.stringify({ jwt: token })

  // Encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  return [`express:sess=${base64}`] // as array for supertest
}
