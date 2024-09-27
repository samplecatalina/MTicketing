import { Publisher, Subjects, OrderCancelledEvent } from '../../../../common/src'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
