import { Publisher, PaymentCreatedEvent, Subjects } from '../../../../common/src'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
