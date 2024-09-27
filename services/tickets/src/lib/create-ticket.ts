import { Express } from 'express'
import request from 'supertest'

export default (app: Express) => (
  ticket: { title?: any; price?: any },
  cookie: string[] = global.signup()
) => {
  const { title, price } = ticket
  return request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
}
