import request from 'supertest'

import { app } from '../../app'
import { fakeId } from '../../lib'

it('returns 404 if the ticket is not found', async () => {
  await request(app).get(`/api/tickets/${fakeId()}`).send().expect(404)
})

it('returns the ticket if the ticket is found', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'test', price: 5 })
    .expect(201)

  const {
    body: { title, price, userId }
  } = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)

  expect(title).toEqual('test')
  expect(price).toEqual(5)
})
