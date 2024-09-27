/*
  Singleton implementation
  so that we can share an instance of Kafka client around
  without having a circular dependency issue
*/
import { Kafka, KafkaConfig, Producer } from 'kafkajs';

class KafkaWrapper {
  private _kafka?: Kafka;
  private _producer?: Producer;

  get client() {
    if (!this._kafka) {
      throw new Error('Cannot access Kafka client before connecting');
    }
    return this._kafka;
  }

  get producer() {
    if (!this._producer) {
      throw new Error('Producer not initialized');
    }
    return this._producer;
  }

  async connect(brokers: string[], clientId: string, ssl?: boolean) {
    this._kafka = new Kafka({
      clientId,
      brokers,
      ssl,
    });

    // Initialize and connect the producer
    this._producer = this._kafka.producer();
    await this._producer.connect();

    console.log('Connected to Kafka');
  }

  async disconnect() {
    if (this._producer) {
      await this._producer.disconnect();
    }
    console.log('Disconnected from Kafka');
  }
}

export const kafkaWrapper = new KafkaWrapper();
