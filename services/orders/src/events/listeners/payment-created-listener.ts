import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
  NotFoundError,
} from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { queueGroupName } from './queue-group-name';
import { Order } from '../../models';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly topic = Subjects.PaymentCreated;
  groupId = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], payload: EachMessagePayload) {
    const { orderId } = data;

    // Update order status
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();

    order.set({ status: OrderStatus.Complete });
    await order.save();

    // TODO define OrderUpdatedPublisher
    // and emit order:updated event

    // No need to manually acknowledge the message in KafkaJS
  }
}
