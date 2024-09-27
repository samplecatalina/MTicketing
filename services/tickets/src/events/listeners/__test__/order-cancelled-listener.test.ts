import { OrderCancelledEvent } from '../../../../../common/src';
import { EachMessagePayload } from 'kafkajs';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { kafkaWrapper } from '../../../kafkaWrapper';
import { Ticket } from '../../../models';
import { fakeId } from '../../../lib';

const setup = async () => {
  // Instantiate listener
  const listener = new OrderCancelledListener(kafkaWrapper.client);

  const ticket = Ticket.build({ title: 'test', price: 10, userId: fakeId() });
  await ticket.save();

  const orderId = fakeId();
  ticket.set({ orderId });
  await ticket.save();
  const { version, id } = ticket;

  // Fake event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version,
    ticket: { id },
  };

  // Fake EachMessagePayload
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

  return { listener, ticket, data, payload };
};

it('sets the orderId of the ticket to undefined', async () => {
  const { listener, ticket, data, payload } = await setup();
  expect(ticket.orderId).toEqual(ticket.orderId);

  // Call onMessage
  await listener.onMessage(data, payload);

  // Find ticket
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
  expect(updatedTicket!.version).toEqual(ticket.version + 1);
});

it('processes the message successfully', async () => {
  const { listener, data, payload } = await setup();
  await expect(listener.onMessage(data, payload)).resolves.not.toThrow();
});

it('publishes a ticket:updated event', async () => {
  const { listener, data, payload } = await setup();
  await listener.onMessage(data, payload);

  expect(kafkaWrapper.producer.send).toHaveBeenCalled();

  const sendMock = kafkaWrapper.producer.send as jest.Mock;
  const event = sendMock.mock.calls[0][0];
  expect(event.topic).toEqual('ticket:updated');
  const message = event.messages[0];
  const publishedData = JSON.parse(message.value.toString());
  expect(publishedData.orderId).toBeUndefined();
});
