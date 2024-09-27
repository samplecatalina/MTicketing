import { Router } from 'express'
import { NotFoundError } from '../../../common/src'

import { Ticket } from '../models'

const router = Router()

router.get('/api/tickets/:id', async ({ params: { id } }, res) => {
  const ticket = await Ticket.findById(id)

  if (!ticket) throw new NotFoundError()
  return res.status(200).send(ticket)
})

export { router as showOneTicketRouter }
