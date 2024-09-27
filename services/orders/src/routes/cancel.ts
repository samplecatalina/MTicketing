import { Router, Request, Response } from 'express'
import {
  NotFoundError,
  validateRequest,
  requireAuth,
  ForbiddenError,
  OrderStatus
} from '../../../common/src'
import { param } from 'express-validator'

import { Order } from '../models'
import { OrderCancelledPublisher } from '../events'
import { kafkaWrapper } from '../kafkaWrapper'

const router = Router()

router.patch(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .isMongoId()
      .withMessage('Incorrectly formatted orderId (must be Mongo Object ID')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const orderId: string = req.params.orderId
    const order = await Order.findById(orderId).populate('ticket')

    if (!order) throw new NotFoundError()
    if (order.userId !== req.currentUser!.id)
      throw new ForbiddenError('You are not the owner of this order')

    order.status = OrderStatus.Cancelled
    await order.save()

    // Publish event
    new OrderCancelledPublisher(kafkaWrapper.client).publish({
      id: order.id,
      ticket: { id: order.ticket.id },
      version: order.version
    })

    return res.status(200).send(order)
  }
)

export { router as deleteOrderRouter }
