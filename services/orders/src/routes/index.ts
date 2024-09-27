import { Router } from 'express'

import { createOrderRouter } from './new'
import { showOneOrderRouter } from './show-one'
import { showAllOrderRouter } from './show-all'
import { deleteOrderRouter } from './cancel'

const router = Router()

router.use([
  createOrderRouter,
  showOneOrderRouter,
  showAllOrderRouter,
  deleteOrderRouter
])

export { router }
