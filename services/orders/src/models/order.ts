import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '../../../common/src'
export { OrderStatus }
import { TicketDoc } from './ticket'

export interface OrderAttrs {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketDoc
}

/*
  interfaces that describe the properties
  that a Order DOCUMENT HAS
  required for type checking of a Order INSTANCE
*/
interface OrderDoc extends mongoose.Document {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketDoc
  version: number
}

/*
  interface that describes the properties
  that a Order MODEL HAS
  required to BUILD a new Order
*/
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: { type: mongoose.Schema.Types.Date },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
)

orderSchema.set('versionKey', 'version') //by default uses __v
orderSchema.plugin(updateIfCurrentPlugin)
// orderSchema.pre('save', function (done) {
//   // @ts-ignore
//   this.$where = { version: this.get('version') - 1 }
//   done()
// })

// build a custom function into a model
orderSchema.static('build', (attrs: OrderAttrs) => new Order(attrs))

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
