import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  Subjects,
  OrderStatus
} from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly topic = Subjects.OrderCancelled;
  groupId = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], payload: EachMessagePayload) {
    const {
      ticket: { id: ticketId }
    } = data;

    // Find ticket order is reserving
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new NotFoundError();

    // Mark ticket as reserved by setting its orderId property
    ticket.set({ orderId: undefined });
    await ticket.save();

    // Emit event as we just modified the ticket
    // await it because we don't want to proceed if the publish fails
    await new TicketUpdatedPublisher(this.producer).publish(ticket);

    // No need to manually acknowledge the message in KafkaJS
  }
}
