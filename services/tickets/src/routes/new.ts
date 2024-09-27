import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '../../../common/src'

import { TicketCreatedPublisher } from '../events'
import { Ticket } from '../models'
import { kafkaWrapper } from '../kafkaWrapper'

const router = Router()

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title')
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isString()
      .withMessage('Invalid title (must be string)'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required (> 0)')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      currentUser,
      body: { title, price }
    } = req

    // Add ticket to DB
    // Sure that currentUser is not undefined due to requireAuth middleware
    const ticket = Ticket.build({ title, price, userId: currentUser!.id })
    await ticket.save()

    /*
      emit event
      not relevant to await it, would add more latency
      relevant is to handle publish failures
    */
    new TicketCreatedPublisher(kafkaWrapper.client).publish(
      Object.assign(ticket, { id: ticket.id })
    )

    return res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
