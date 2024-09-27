import { kafkaWrapper } from './kafkaWrapper';
import { OrderCreatedListener } from './events';

const start = async () => {
  console.log('Starting...');

  /*
    Type guard for environment variables
    Check for required Kafka environment variables
  */
  const { KAFKA_BROKERS, KAFKA_CLIENT_ID } = process.env;
  if (!KAFKA_BROKERS) throw new Error('KAFKA_BROKERS not defined');
  if (!KAFKA_CLIENT_ID) throw new Error('KAFKA_CLIENT_ID not defined');

  try {
    const brokers = KAFKA_BROKERS.split(',');
    await kafkaWrapper.connect(brokers, KAFKA_CLIENT_ID);

    /*
      Handle connection close gracefully.
      It's better to handle client shutdowns visibly in the entry file.
    */
    process.on('SIGINT', async () => {
      await kafkaWrapper.producer.disconnect(); // Disconnect producer
      process.exit();
    });
    process.on('SIGTERM', async () => {
      await kafkaWrapper.producer.disconnect(); // Disconnect producer
      process.exit();
    });

    // Start the OrderCreatedListener
    new OrderCreatedListener(kafkaWrapper.client).listen();
  } catch (err) {
    console.error('Error starting service:', err);
  }
};

start();
