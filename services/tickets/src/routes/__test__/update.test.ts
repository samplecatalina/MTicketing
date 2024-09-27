import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models'
import { kafkaWrapper } from '../../kafkaWrapper'
import { CreateTicket, fakeId } from '../../lib'
const createTicket = CreateTicket(app)

jest.mock('../../kafkaWrapper.ts')

it('returns 404 no ticket matches the provided id', async () => {
  await request(app)
    .put(`/api/tickets/${fakeId()}`)
    .set('Cookie', global.signup())
    .send({ title: 'new title', price: 2 })
    .expect(404)
})

it('returns 401 if user is not authenticated', async () => {
  const response = await createTicket({ title: 'test', price: 5 })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({ title: 'new title', price: 2 })
    .expect(401)
})
it('returns 403 if user is not the creator of the ticket', async () => {
  const response = await createTicket({ title: 'test', price: 5 })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({ title: 'new title', price: 2 })
    .expect(403)
})

it('returns 400 if new title not valid', async () => {
  const cookie = global.signup()
  const response = await createTicket({ title: 'test', price: 5 }, cookie)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 2 })
    .expect(400)
})
it('returns 400 if new price not valid', async () => {
  const cookie = global.signup()
  const response = await createTicket({ title: 'test', price: 5 }, cookie)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'new title', price: -2 })
    .expect(400)
})
it('update existing ticket provided valid inputs', async () => {
  const cookie = global.signup()
  const response = await createTicket({ title: 'test', price: 5 }, cookie)
  const ticket = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'retest', price: 10 })
    .expect(200)

  const { title, price } = ticket.body
  expect(title).toEqual('retest')
  expect(price).toEqual(10)
})

it('publishes an event', async () => {
  const cookie = global.signup()
  const response = await createTicket({ title: 'test', price: 5 }, cookie)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'retest', price: 10 })
    .expect(200)

  expect(kafkaWrapper.client.publish).toHaveBeenCalledTimes(2)
})

it('rejects updates if ticket is reserved', async () => {
  const cookie = global.signup()
  const response = await createTicket({ title: 'test', price: 5 }, cookie)

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: fakeId() })
  await ticket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'retest', price: 10 })
    .expect(400)
})
