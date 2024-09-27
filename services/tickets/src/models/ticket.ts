import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
  title: string
  price: number
  userId: string
}

/*
  interfaces that describe the properties
  that a Ticket DOCUMENT HAS
  required for type checking of a Ticket INSTANCE
*/
interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  userId: string
  version: number
  orderId?: string
}

/*
  interface that describes the properties
  that a TICKET MODEL HAS
  required to BUILD a new ticket
*/
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: { type: String }
  },
  {
    toJSON: {
      transform(_: any, ret: any) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
)

ticketSchema.set('versionKey', 'version') //by default uses __v
ticketSchema.plugin(updateIfCurrentPlugin)

// build a custom function into a model
ticketSchema.static('build', (attrs: TicketAttrs) => new Ticket(attrs))
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
