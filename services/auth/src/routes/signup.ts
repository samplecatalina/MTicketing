import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { BadRequestError, validateRequest } from '../../../common/src'
import { User } from '../models'

const router = Router()

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { email, password } = req.body
    // does user with this email already exist in DB
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new BadRequestError('Email already in use')
    }

    // Add user to DB
    const user = User.build({ email, password })
    await user.save()

    // Generate JWT
    // already type guard in start()
    // tell typescript that JWT_KEY is not undefined with !
    const userJwt = jwt.sign({ email, id: user.id }, process.env.JWT_KEY!)

    // Set it on the session
    // to circumvent error triggerred by req.session.jwt = ...
    req.session = { jwt: userJwt }

    res.status(201).send(user)
  }
)

export { router as signupRouter }
