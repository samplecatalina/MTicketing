import request from 'supertest'

import { app } from '../../app'
import { CreateTicket } from '../../lib'
const createTicket = CreateTicket(app)

it('can fetch a list of tickets', async () => {
  await Promise.all(
    [
      { title: 'ticket1', price: 10 },
      { title: 'ticket2', price: 5 },
      { title: 'ticket3', price: 6 }
    ].map(async ({ title, price }) => {
      await createTicket({ title, price })
    })
  )

  const { body: tickets } = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)
  expect(tickets.length).toEqual(3)
})
