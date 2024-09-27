import { Listener, OrderCreatedEvent, Subjects } from '../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { msFromNowUntil } from '../../lib';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly topic = Subjects.OrderCreated;
  groupId = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], payload: EachMessagePayload) {
    const delay = msFromNowUntil(data.expiresAt);

    await expirationQueue.add(
      { orderId: data.id },
      { delay: 60000 /* UPDATE TO 15 MIN FOR PROD */ }
    );

    // No need to manually acknowledge the message in KafkaJS
    // Unless you have autoCommit disabled and need to commit offsets manually
  }
}
