import { Listener, OrderCreatedEvent, Subjects } from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { Order } from '../../models';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly topic = Subjects.OrderCreated;
  groupId = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], payload: EachMessagePayload) {
    const {
      id,
      ticket: { price },
      status,
      userId,
      version,
    } = data;
    const order = Order.build({ id, price, status, userId, version });

    await order.save();
    // No need to manually acknowledge the message in KafkaJS
  }
}
