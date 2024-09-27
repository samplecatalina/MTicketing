import { Publisher, Subjects, TicketUpdatedEvent } from '../../../../common/src'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
