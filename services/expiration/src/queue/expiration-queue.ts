import Queue from 'bull'

import { ExpirationCompletePublisher } from '../events'
import { kafkaWrapper } from '../kafkaWrapper'

interface Payload {
  orderId: string
}

// Enqueue
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: { host: process.env.REDIS_HOST }
})

// Process job
expirationQueue.process(async job => {
  new ExpirationCompletePublisher(kafkaWrapper.client).publish({
    orderId: job.data.orderId
  })
})

export { expirationQueue }
