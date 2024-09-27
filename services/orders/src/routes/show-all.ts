import { Router } from 'express'
import { requireAuth } from '../../../common/src'

import { Order } from '../models'

const router = Router()

router.get('/api/orders', requireAuth, async ({ currentUser }, res) => {
  const orders = await Order.find({ userId: currentUser!.id }).populate(
    'ticket'
  )

  return res.status(200).send(orders)
})

export { router as showAllOrderRouter }
