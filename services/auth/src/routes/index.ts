import { Router } from 'express'

import { currentUserRouter } from './current-user'
import { signinRouter } from './signin'
import { signupRouter } from './signup'
import { signoutRouter } from './signout'

const router = Router()

router.use([currentUserRouter, signinRouter, signupRouter, signoutRouter])

export { router }
