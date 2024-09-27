import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface UserPayload {
  id: string
  email: string
}

/*
 Reach into existing Express Request type definition
 and augment it
*/
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (req: Request, _: Response, next: NextFunction) => {
  if (!req.session?.jwt) return next()

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload
    req.currentUser = payload
  } catch (err) {
    /*
    we want to continue to next middleware/route no matter what
    so we call next() after this block
    */
  }
  next()
}
