import { Router } from 'express'

import { Ticket } from '../models'

const router = Router()

router.get('/api/tickets', async (_, res) => {
  const tickets = await Ticket.find({
    // return only tickets not reserved/paid
    orderId: undefined
  })

  return res.status(200).send(tickets)
})

export { router as showAllTicketRouter }
