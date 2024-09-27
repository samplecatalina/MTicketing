import { Kafka, Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs';
import { Event } from './interfaces';

export abstract class Listener<T extends Event> {
  // Name of the topic the listener is going to subscribe to
  abstract topic: T['subject'];

  // Name of the consumer group the listener will join
  abstract groupId: string;

  // Callback to run when a message is received
  abstract onMessage(data: T['data'], payload: EachMessagePayload): Promise<void> | void;

  protected kafka: Kafka;
  protected consumer: Consumer;

  constructor(kafka: Kafka) {
    this.kafka = kafka;
  }

  async listen(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        console.log(`Message received: ${this.topic} / ${this.groupId}`);
        const parsedData = this.parseMessage(payload.message);

        try {
          await this.onMessage(parsedData, payload);
        } catch (err) {
          console.error(`Error processing message: ${err}`);
          // Re-throw the error to prevent committing the offset
          throw err;
        }
      },
    });
  }

  parseMessage(message: KafkaMessage): any {
    const data = message.value;
    return data ? JSON.parse(data.toString('utf8')) : null;
  }
}
