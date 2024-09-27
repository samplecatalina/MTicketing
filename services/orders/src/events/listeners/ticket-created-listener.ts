import { EachMessagePayload } from 'kafkajs';
import { Subjects, Listener, TicketCreatedEvent } from '../../../../common/src';

import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly topic = Subjects.TicketCreated;
  groupId = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], payload: EachMessagePayload) {
    const { title, price, id } = data;
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    // No need to manually acknowledge the message in KafkaJS
  }
}
