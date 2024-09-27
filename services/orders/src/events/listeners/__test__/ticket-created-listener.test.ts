import { TicketCreatedEvent } from '../../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { fakeId } from '../../../lib';
import { Ticket } from '../../../models';
import { kafkaWrapper } from '../../../kafkaWrapper';
import { TicketCreatedListener } from '../ticket-created-listener';

const setup = async () => {
  // Instantiate a listener
  const listener = new TicketCreatedListener(kafkaWrapper.client);

  // Fake an event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: fakeId(),
    title: 'concert',
    price: 10,
    userId: fakeId(),
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

it('creates and saves a ticket', async () => {
  const { listener, data, payload } = await setup();

  // Call onMessage
  await listener.onMessage(data, payload);

  // Assertions
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('processes the message successfully', async () => {
  const { listener, data, payload } = await setup();

  // Call onMessage
  await expect(listener.onMessage(data, payload)).resolves.not.toThrow();
});
