import { Kafka, Producer, Message } from 'kafkajs';
import { Event } from './interfaces';

export abstract class Publisher<T extends Event> {
  // Name of the Kafka topic to publish to
  abstract topic: T['subject'];

  protected producer: Producer;

  constructor(kafka: Kafka) {
    this.producer = kafka.producer();
  }

  // Connect the producer to the Kafka broker
  async connect(): Promise<void> {
    await this.producer.connect();
  }

  // Publish a message to the Kafka topic
  async publish(data: T['data']): Promise<void> {
    try {
      const message: Message = {
        value: JSON.stringify(data),
      };

      await this.producer.send({
        topic: this.topic,
        messages: [message],
      });

      console.log('Event published to topic', this.topic);
    } catch (err) {
      console.error('Error publishing event', err);
      throw err;
    }
  }

  // Disconnect the producer from the Kafka broker
  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}
