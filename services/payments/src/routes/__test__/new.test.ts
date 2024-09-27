import request from 'supertest'
require('dotenv').config()

import { app } from '../../app'
import { fakeId, createOrder } from '../../lib'
import { Payment } from '../../models'
import { OrderStatus } from '../../../../common/src'
import { stripe } from '../../lib'

// comment for alternative stripe test
// jest.mock('../../lib/stripe')

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({ token: 'asda', orderId: fakeId() })
    .expect(404)
})

it('returns 403 when purchasing an order that does not belong to the authenticated user', async () => {
  const { id } = await createOrder()
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({ token: 'asda', orderId: id })
    .expect(403)
})

it('returns 400 when purchasing an already cancelled order', async () => {
  const userId = fakeId()
  await createOrder({
    id: fakeId(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled
  })

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .expect(400)
})

// it('returns 201 with valid inputs', async () => {
//   const userId = fakeId()
//   const order = await createOrder({
//     id: fakeId(),
//     userId,
//     version: 0,
//     price: 10,
//     status: OrderStatus.Created
//   })

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signup(userId))
//     .send({ token: 'tok_visa', orderId: order.id })
//     .expect(201)

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

//   expect(chargeOptions.source).toEqual('tok_visa')
//   expect(chargeOptions.currency).toEqual('usd')
//   expect(chargeOptions.amount).toEqual(1000)
// })

// alternative stripe test with real API instead of mock
it('returns 201 and stores a payment in DB if valid inputs are provided', async () => {
  const userId = fakeId()
  const price = Math.floor(Math.random() * 100000)
  const order = await createOrder({
    id: fakeId(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  })

  const {
    body: { id }
  } = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201)

  const stripeCharges = await stripe.charges.list({ limit: 50 })
  const stripeCharge = stripeCharges.data.find(
    charge => charge.amount === price * 100
  )

  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toEqual('usd')

  const payment = await Payment.findOne({
    stripeId: stripeCharge!.id,
    orderId: order.id
  })

  expect(payment).not.toBeNull()
  expect(id).toEqual(payment!.id)
})
