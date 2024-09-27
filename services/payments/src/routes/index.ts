import { Router } from 'express'

import { createChargeRouter } from './new'

const router = Router()

router.use([createChargeRouter])

export { router }
