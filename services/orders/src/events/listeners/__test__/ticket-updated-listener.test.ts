import { TicketUpdatedEvent } from '../../../../../common/src';
import { EachMessagePayload } from 'kafkajs';

import { fakeId, createTicket } from '../../../lib';
import { Ticket } from '../../../models';
import { kafkaWrapper } from '../../../kafkaWrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Instantiate a listener
  const listener = new TicketUpdatedListener(kafkaWrapper.client);

  // Create a ticket
  const id = fakeId();
  const ticket = await createTicket({
    title: 'test',
    price: 10,
    id,
  });

  // Fake an event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id,
    title: 'new',
    price: 999,
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

  return { ticket, listener, data, payload };
};

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, payload } = await setup();

  // Call onMessage
  await listener.onMessage(data, payload);

  // Assertions
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.version).toEqual(data.version);
});

it('processes the message successfully', async () => {
  const { listener, data, payload } = await setup();

  // Call onMessage
  await expect(listener.onMessage(data, payload)).resolves.not.toThrow();

  // Assertions
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.version).toEqual(data.version);
});

it('does not process the message if event is out of order (wrong version number)', async () => {
  const { listener, data, payload } = await setup();

  data.version = 5;
  await expect(listener.onMessage(data, payload)).rejects.toThrow();

  // No need to check commitOffsets as it's handled by KafkaJS internals
});

it('', async () => {});
