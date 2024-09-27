import request from 'supertest'
import { app } from '../../app'

it('responds with details about current user', async () => {
  /*
  const signupResponse = await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.co', password: 'password' })
    .expect(201)

  const responseWithoutCookie = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200)

  
    // won't see the cookie. (currentUser: null)
    // cookies are managed by browsers.
    // supertest doesn't manage cookies automatically.
    // cookie isn't sent along with second request.
    // need to include it manually
  
  expect(responseWithoutCookie.body.currentUser === null)

  */

  const cookie = await global.signup()
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(response.body.currentUser.email).toEqual('test@test.com')
})

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200)

  expect(response.body.currentUser).toEqual(null)
})
