import request from 'supertest'
import { OrderStatus } from '../../../../common/src'

import { app } from '../../app'
import { createTicket, fakeId } from '../../lib'
import { kafkaWrapper } from '../../kafkaWrapper'

it('returns 404 if no orders found for given orderId', async () => {
  const ticket = await createTicket()
  const cookie = global.signup()
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .patch(`/api/orders/${fakeId()}`)
    .set('Cookie', cookie)
    .send()
    .expect(404)
})

it('returns 401 if user is not authenticated', async () => {
  const ticket = await createTicket()
  const cookie = global.signup()
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app).patch(`/api/orders/${order.id}`).send().expect(401)
})

it('returns 400 if the orderId is not a MongoDB ObjectId', async () => {
  await request(app)
    .patch('/api/orders/123')
    .set('Cookie', global.signup())
    .send()
    .expect(400)
})

it('returns 403 if authenticated user is not the one who created the order', async () => {
  const ticket = await createTicket()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', global.signup())
    .send()
    .expect(403)
})

it('cancels one order', async () => {
  const ticket = await createTicket()
  const cookie = global.signup()
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
  // .expect(201)

  const { body: cancelledOrder } = await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(cancelledOrder.id).toEqual(order.id)
  expect(cancelledOrder.ticket.id).toEqual(ticket.id)
  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled)
})

it('emits an oder:cancelled event', async () => {
  const ticket = await createTicket()
  const cookie = global.signup()
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(kafkaWrapper.client.publish).toHaveBeenCalledTimes(2)
})
