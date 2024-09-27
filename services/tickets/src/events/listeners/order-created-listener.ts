import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  Subjects
} from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly topic = Subjects.OrderCreated;
  groupId = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], payload: EachMessagePayload) {
    const {
      id: orderId,
      ticket: { id: ticketId }
    } = data;
    // Find ticket order is reserving
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new NotFoundError();

    // Mark ticket as reserved by setting its orderId property
    ticket.set({ orderId });
    await ticket.save();

    // Emit event as we just modified the ticket
    // await it because we don't want to proceed if the publish fails
    await new TicketUpdatedPublisher(this.producer).publish(Object.assign(ticket));

    // No need to manually acknowledge the message in KafkaJS
  }
}
