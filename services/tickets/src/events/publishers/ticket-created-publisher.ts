import { Publisher, Subjects, TicketCreatedEvent } from '../../../../common/src'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
