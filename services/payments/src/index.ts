import mongoose from 'mongoose';

import { app } from './app';
import { kafkaWrapper } from './kafkaWrapper';
import { OrderCancelledListener, OrderCreatedListener } from './events';

const start = async () => {
  console.log('Starting...');

  // Type guard for environment variables
  const { JWT_KEY, MONGO_URI, KAFKA_BROKERS, KAFKA_CLIENT_ID, STRIPE_KEY } = process.env;
  if (!JWT_KEY) throw new Error('JWT_KEY not defined');
  if (!MONGO_URI) throw new Error('MONGO_URI not defined');
  if (!KAFKA_BROKERS) throw new Error('KAFKA_BROKERS not defined');
  if (!KAFKA_CLIENT_ID) throw new Error('KAFKA_CLIENT_ID not defined');
  if (!STRIPE_KEY) throw new Error('STRIPE_KEY not defined');

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
    new OrderCreatedListener(kafkaWrapper.client).listen();
    new OrderCancelledListener(kafkaWrapper.client).listen();

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to payments DB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => console.log('Payments service listening on port 3000'));
};

start();
