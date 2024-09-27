import { EachMessagePayload } from 'kafkajs';
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
  NotFoundError
} from '../../../../common/src';

import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly topic = Subjects.TicketUpdated;
  groupId = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], payload: EachMessagePayload) {
    const { title, price, version } = data;
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw new NotFoundError();

    ticket.set({ title, price, version });
    await ticket.save();

    // No need to manually acknowledge the message in KafkaJS
  }
}
