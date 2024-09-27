import { Document, model, Model, Schema } from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '../../../common/src'

export interface OrderAttrs {
  id: string
  status: OrderStatus
  version: number
  userId: string
  price: number
}

interface OrderDoc extends Document {
  // id: string,
  status: OrderStatus
  version: number
  userId: string
  price: number
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true, enum: Object.values(OrderStatus) }
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

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = ({
  id,
  version,
  price,
  userId,
  status
}: OrderAttrs) =>
  new Order({
    _id: id,
    version,
    price,
    userId,
    status
  })

const Order = model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
