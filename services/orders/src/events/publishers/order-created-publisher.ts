import { Publisher, Subjects, OrderCreatedEvent } from '../../../../common/src'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
