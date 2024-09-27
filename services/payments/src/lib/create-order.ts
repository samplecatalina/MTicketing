import { Order, OrderAttrs } from '../models'
import { OrderStatus } from '../../../common/src'
import fakeId from './fakeId'

export default async (
  attrs: OrderAttrs = {
    id: fakeId(),
    userId: fakeId(),
    status: OrderStatus.Created,
    version: 0,
    price: 10
  }
) => {
  const order = Order.build(attrs)
  await order.save()
  return order
}
