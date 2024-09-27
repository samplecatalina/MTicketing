import { OrderCreatedEvent, OrderStatus } from '../../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { Order } from '../../../models';
import { fakeId } from '../../../lib';
import { kafkaWrapper } from '../../../kafkaWrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const listener = new OrderCreatedListener(kafkaWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: fakeId(),
    version: 0,
    expiresAt: 'ad',
    userId: fakeId(),
    status: OrderStatus.Created,
    ticket: { id: fakeId(), price: 10 },
  };

  // Fake a payload
  const payload: EachMessagePayload = {
    topic: listener.topic,
    partition: 0,
    message: {
      key: null,
      value: Buffer.from(JSON.stringify(data)),
      offset: '0',
      timestamp: Date.now().toString(),
      headers: {},
    },
    heartbeat: jest.fn(),
    isRunning: jest.fn().mockReturnValue(true),
    isStale: jest.fn().mockReturnValue(false),
    pause: jest.fn(),
    commitOffsets: jest.fn(),
  };

  return { listener, data, payload };
};

it('replicates the order info', async () => {
  const { listener, data, payload } = await setup();
  await listener.onMessage(data, payload);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
  expect(order!.id).toEqual(data.id);
  expect(order!.version).toEqual(data.version);
  expect(order!.userId).toEqual(data.userId);
  expect(order!.status).toEqual(data.status);
});

it('processes the message successfully', async () => {
  const { listener, data, payload } = await setup();
  await expect(listener.onMessage(data, payload)).resolves.not.toThrow();
});
