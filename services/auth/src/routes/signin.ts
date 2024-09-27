import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest, BadRequestError } from '../../common/src'
import { User } from '../models'
import { Password } from '../lib'

const router = Router()

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid/provided'),
    body('password').trim().notEmpty().withMessage('Password must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      /*
        It would indeed be more precise to answer with
        a 404 NotFoundError, but we are dealing with
        auth here, for more security, we want to give
        as little info as possible about the error
      */
      throw new BadRequestError('Invalid credentials')
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    )

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials')
    }

    // Generate JWT
    const userJwt = jwt.sign(
      { email, id: existingUser.id },
      process.env.JWT_KEY!
    )
    req.session = { jwt: userJwt }

    res.status(200).send(existingUser)
  }
)

export { router as signinRouter }
