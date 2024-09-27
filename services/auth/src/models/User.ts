import mongoose from 'mongoose'

import { Password } from '../lib'

interface UserAttrs {
  email: string
  password: string
}
/*
  interface that describes the properties
  that a USER MODEL HAS
  required to BUILD a new user
*/
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

/*
  interfaces that describe the properties
  that a USER DOCUMENT HAS
  required for type checking of a USER INSTANCE
*/
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, // not tied to TypeScript
      required: true
    },
    password: { type: String, required: true }
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
      },
      versionKey: false
    }
  }
)

// Hash password
/*
  Dont use arrow function done => {}!
  This would overwrite `this` to the global context
  We want `this` to still refer to the Document
*/
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hash = await Password.hash(this.get('password'))
    this.set('password', hash)
  }
  // @ts-ignore
  done()
})

// build a custom function into a model
userSchema.statics.build = (attrs: UserAttrs) => new User(attrs)
const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
