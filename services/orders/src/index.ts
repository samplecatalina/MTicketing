import mongoose from 'mongoose';

import { app } from './app';
import { kafkaWrapper } from './kafkaWrapper';
import {
  TicketCreatedListener,
  TicketUpdatedListener,
  ExpirationCompleteListener,
  PaymentCreatedListener,
} from './events';

const start = async () => {
  console.log('Starting...');

  // Type guard for environment variables
  const { JWT_KEY, MONGO_URI, KAFKA_BROKERS, KAFKA_CLIENT_ID } = process.env;
  if (!JWT_KEY) throw new Error('JWT_KEY not defined');
  if (!MONGO_URI) throw new Error('MONGO_URI not defined');
  if (!KAFKA_BROKERS) throw new Error('KAFKA_BROKERS not defined');
  if (!KAFKA_CLIENT_ID) throw new Error('KAFKA_CLIENT_ID not defined');

  try {
    const brokers = KAFKA_BROKERS.split(',');
    await kafkaWrapper.connect(brokers, KAFKA_CLIENT_ID);

    // Handle Kafka client disconnect
    process.on('SIGINT', async () => {
      await kafkaWrapper.producer.disconnect();
      process.exit();
    });
    process.on('SIGTERM', async () => {
      await kafkaWrapper.producer.disconnect();
      process.exit();
    });

    // Initialize listeners
    new TicketCreatedListener(kafkaWrapper.client).listen();
    new TicketUpdatedListener(kafkaWrapper.client).listen();
    new ExpirationCompleteListener(kafkaWrapper.client).listen();
    new PaymentCreatedListener(kafkaWrapper.client).listen();

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to orders DB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => console.log('Orders service listening on port 3000'));
};

start();
