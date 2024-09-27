import request from 'supertest'

import { app } from '../../app'
import { kafkaWrapper } from '../../kafkaWrapper'
import { Ticket } from '../../models'
import { CreateTicket } from '../../lib'
const createTicket = CreateTicket(app)

it('has a route handler listening to /api/tickets for posts requests', async () => {
  const response = await request(app).post('/api/tickets').send({})
  expect(response.status).not.toEqual(404)
})

it('can only be accessed if user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401)
  await createTicket({ title: 'test', price: 5 }).expect(201)
})

it('returns an error if an invalid title is provided', async () => {
  await createTicket({ title: '', price: 10 }).expect(400)
  await createTicket({ title: 2, price: 10 }).expect(400)
  await createTicket({ price: 10 }).expect(400)
})

it('returns an error if an invalid price is provided', async () => {
  await createTicket({ title: 'Test', price: 'invalid' }).expect(400)
  await createTicket({ title: 'Test', price: -1 }).expect(400)
  await createTicket({ title: 'Test' }).expect(400)
})

it('creates a ticket if valid inputs are provided', async () => {
  expect((await Ticket.find({})).length).toEqual(0)

  const response = await createTicket({ title: 'test', price: 5 }).expect(201)
  const { title, price, userId } = response.body

  expect(title).toEqual('test')
  expect(price).toEqual(5)
  expect((await Ticket.find({})).length).toEqual(1)
})

it('publishes an event', async () => {
  await createTicket({ title: 'test', price: 5 }).expect(201)

  expect(kafkaWrapper.client.publish).toHaveBeenCalledTimes(1)
})
