import { OrderCancelledEvent, OrderStatus } from '../../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { Order } from '../../../models';
import { fakeId, createOrder } from '../../../lib';
import { kafkaWrapper } from '../../../kafkaWrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(kafkaWrapper.client);

  const order = await createOrder();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: { id: fakeId() },
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

it('cancels the order', async () => {
  const { listener, data, payload } = await setup();
  await listener.onMessage(data, payload);

  const order = await Order.findById(data.id);

  expect(order!.id).toEqual(data.id);
  expect(order!.version).toEqual(data.version);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('processes the message successfully', async () => {
  const { listener, data, payload } = await setup();
  await expect(listener.onMessage(data, payload)).resolves.not.toThrow();
});
