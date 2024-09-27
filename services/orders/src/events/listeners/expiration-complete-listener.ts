import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  NotFoundError,
  OrderStatus,
} from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly topic = Subjects.ExpirationComplete;
  groupId = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], payload: EachMessagePayload) {
    // Find order
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) throw new NotFoundError();

    // Don't cancel completed orders
    if (order.status === OrderStatus.Complete) return;

    // Unreserve ticket
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    // Emit order:cancelled event
    // Await before proceeding
    await new OrderCancelledPublisher(this.producer).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id },
    });

    // No need to manually acknowledge the message in KafkaJS
  }
}
