import { OrderStatus, ExpirationCompleteEvent } from '../../../../../common/src';
import { EachMessagePayload } from 'kafkajs';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { kafkaWrapper } from '../../../kafkaWrapper';
import { Order, Ticket } from '../../../models';
import { createTicket, createOrder } from '../../../lib';

const setup = async () => {
  const listener = new ExpirationCompleteListener(kafkaWrapper.client);
  const ticket = await createTicket();
  const order = await createOrder({
    userId: 'adsa',
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  });

  const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

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

  // Mock the producer's send method
  kafkaWrapper.producer.send = jest.fn();

  return { listener, data, payload, order };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, payload } = await setup();
  await listener.onMessage(data, payload);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order:cancelled event', async () => {
  const { listener, order, data, payload } = await setup();
  await listener.onMessage(data, payload);

  expect(kafkaWrapper.producer.send).toHaveBeenCalled();

  const event = (kafkaWrapper.producer.send as jest.Mock).mock.calls[0][0];

  expect(event.topic).toEqual('order:cancelled');
  const message = event.messages[0];
  const publishedData = JSON.parse(message.value.toString());
  expect(publishedData.id).toEqual(order.id);
});

it('processes the message successfully', async () => {
  const { listener, data, payload } = await setup();
  await expect(listener.onMessage(data, payload)).resolves.not.toThrow();
});
