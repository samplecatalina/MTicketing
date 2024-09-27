import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
  OrderStatus
} from '../../../common/src'

import { Order, Ticket } from '../models'
import { kafkaWrapper } from '../kafkaWrapper'
import { OrderCreatedPublisher } from '../events'

const EXPIRATION_WINDOW_SECONDS = 15 * 60
const router = Router()

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      .isString()
      .isMongoId()
      .withMessage('Valid ticketId required (not empty string)')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      currentUser,
      body: { ticketId }
    } = req

    // Find ticket user is trying to order
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) throw new NotFoundError()

    const isReserved = await ticket.isReserved()
    if (isReserved) throw new BadRequestError('This ticket is already reserved')

    // Calculate expiration date for this order
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build order and save to DB
    const order = Order.build({
      userId: currentUser!.id,
      status: OrderStatus.Created,
      expiresAt,
      ticket
    })
    await order.save()
    const { id, userId, status, version } = order

    /*
      Publish event
      not relevant to await it, would add more latency
      relevant is to handle publish failures
    */
    new OrderCreatedPublisher(kafkaWrapper.client).publish({
      id,
      expiresAt: order.expiresAt.toISOString(),
      ticket: { id: ticket.id, price: ticket.price },
      userId,
      status,
      version
    })

    return res.status(201).send(order)
  }
)

export { router as createOrderRouter }
