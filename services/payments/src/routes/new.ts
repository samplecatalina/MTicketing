import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  OrderStatus
} from '../../../common/src'

import { stripe } from '../lib'
import { Order, Payment } from '../models'
import { PaymentCreatedPublisher } from '../events'
import { kafkaWrapper } from '../kafkaWrapper'

const router = Router()

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').notEmpty().withMessage('Token must be provided'),
    body('orderId').notEmpty().withMessage('orderId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      currentUser,
      body: { token, orderId }
    } = req
    const order = await Order.findById(orderId)

    if (!order) throw new NotFoundError()
    if (order.userId !== currentUser!.id)
      throw new ForbiddenError(
        'Not authorized to pay for an order/ticket you do not own'
      )
    if (order.status == OrderStatus.Cancelled)
      throw new BadRequestError('Cannot pay for a cancelled order')

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, // cents
      source: token
    })

    // create payment
    const payment = Payment.build({ orderId, stripeId: charge.id })
    await payment.save()

    // emit event
    await new PaymentCreatedPublisher(kafkaWrapper.client).publish(
      Object.assign(payment, { id: payment.id })
    )

    res.status(201).send({ id: payment.id })
  }
)

export { router as createChargeRouter }
