import { Router } from 'express'

import { createTicketRouter } from './new'
import { showOneTicketRouter } from './show-one'
import { showAllTicketRouter } from './show-all'
import { updateTicketRouter } from './update'

const router = Router()

router.use([
  createTicketRouter,
  showOneTicketRouter,
  showAllTicketRouter,
  updateTicketRouter
])

export { router }
