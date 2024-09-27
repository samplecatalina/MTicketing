import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  ForbiddenError,
  NotFoundError,
  BadRequestError
} from '../../../common/src'

import { Ticket } from '../models'
import { TicketUpdatedPublisher } from '../events'
import { kafkaWrapper } from '../kafkaWrapper'

const router = Router()

router.put(
  '/api/tickets/:id',
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
      params: { id },
      body: { title, price }
    } = req

    const ticket = await Ticket.findById(id)
    if (!ticket) throw new NotFoundError()
    if (ticket.orderId)
      throw new BadRequestError('Cannot edit a reserved ticket')
    if (ticket.userId !== currentUser!.id)
      throw new ForbiddenError('You are not the creator of this ticket')

    // Update ticket in DB
    ticket.set({ title, price })
    await ticket.save()

    /*
      emit event
      not relevant to await it, would add more latency
      relevant is to handle publish failures
    */
    new TicketUpdatedPublisher(kafkaWrapper.client).publish(
      Object.assign(ticket, { id: ticket.id })
    )

    return res.status(200).send(ticket)
  }
)

export { router as updateTicketRouter }
