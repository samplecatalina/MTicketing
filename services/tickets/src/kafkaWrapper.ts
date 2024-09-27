/*
  singleton implementation
  so that we can share an instance of the Kafka client around
  without having a circular dependency issue
*/
import { Kafka, Producer } from 'kafkajs';

class KafkaWrapper {
  private _client?: Kafka;
  private _producer?: Producer;

  get client() {
    if (!this._client)
      throw new Error('Cannot access Kafka client before connecting');
    return this._client;
  }

  get producer() {
    if (!this._producer)
      throw new Error('Cannot access Kafka producer before connecting');
    return this._producer;
  }

  async connect(brokers: string[], clientId: string) {
    this._client = new Kafka({
      clientId,
      brokers,
    });

    this._producer = this._client.producer();

    try {
      await this._producer.connect();
      console.log('Connected to Kafka');
    } catch (err) {
      console.error('Error connecting to Kafka:', err);
      throw err;
    }
  }
}

export const kafkaWrapper = new KafkaWrapper();
