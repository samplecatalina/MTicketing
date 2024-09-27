import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderStatus,
  Subjects
} from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { Order } from '../../models';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly topic = Subjects.OrderCancelled;
  groupId = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], payload: EachMessagePayload) {
    const { id: orderId, version } = data;
    const order = await Order.findOne({ _id: orderId, version: version - 1 });

    if (!order) throw new NotFoundError();

    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    // No need to manually acknowledge the message in KafkaJS
  }
}
