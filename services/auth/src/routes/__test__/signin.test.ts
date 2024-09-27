import request from 'supertest'
import { app } from '../../app'

it('fails if inexisting email is provided', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: '', password: 'password' })
    .expect(400)
})

it('fails if incorrect password is provided', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: 'password' })
    .expect(201)

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.co', password: 'pasword' })
    .expect(400)
})

it('responds with cookie if valid credentials provided', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: 'password' })
    .expect(201)

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.co', password: 'password' })
    .expect(200)

  expect(response.get('Set-Cookie')).toBeDefined()
})

it('', () => {})
