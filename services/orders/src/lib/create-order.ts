import { Order, OrderAttrs } from '../models'

export default async (attrs: OrderAttrs) => {
  const order = Order.build(attrs)
  await order.save()
  return order
}
