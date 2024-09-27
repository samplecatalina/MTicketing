import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on successful signup', () =>
  request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: 'password' })
    .expect(201))

it('returns a 400 if email invalid', () =>
  request(app)
    .post('/api/users/signup')
    .send({ email: 'testtest.co', password: 'password' })
    .expect(400))

it('returns a 400 if password not between 4 and 20 characters long', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: 'pwd' })
    .expect(400)

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: 'passssssssssssssssssss' })
    .expect(400)
})

it('returns a 400 if password or email are missing', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: '' })
    .expect(400)

  await request(app)
    .post('/api/users/signup')
    .send({ email: '', password: 'password' })
    .expect(400)
})

it("can't signup twice with same email", async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 't@t.co', password: 'password' })
    .expect(201)
  await request(app)
    .post('/api/users/signup')
    .send({ email: 't@t.co', password: 'password' })
    .expect(400)
})

it('sets a cookieheader after signing up successfully', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 't@t.co', password: 'password' })
    .expect(201)

  /*
    Fails because we set the `secure` option
    of the cookieSession middleware to true.
    supertest set makes http requests not https
    --> use process.env.NODE_ENV to check the env we're in
  */
  expect(response.get('Set-Cookie')).toBeDefined()
})
