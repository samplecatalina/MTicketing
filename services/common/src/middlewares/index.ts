import cookieSession from 'cookie-session'
import express from 'express'

const middlewares = [
  express.json(),
  cookieSession({
    signed: false,
    secure: false /*process.env.NODE_ENV !== 'test'*/
  })
]

export { middlewares }
export { errorHandler } from './error-handler'
export { validateRequest } from './validate-request'
export { currentUser } from './current-user'
export { requireAuth } from './require-auth'
