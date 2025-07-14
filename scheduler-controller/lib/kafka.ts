import { Consumer, Kafka, KafkaMessage, logLevel } from "kafkajs";

let kafka: Kafka;

export async function initializeConsumer(
	topic: string,
	onMessage: (msg: KafkaMessage) => Promise<void>
) {
	if (!kafka) {
		console.log(process.env.KAFKA_BROKERS!.split(","));
		kafka = new Kafka({
			brokers: process.env.KAFKA_BROKERS!.split(","),
			clientId: process.env.KAFKA_CLIENT_ID,
			logLevel: logLevel.ERROR,
			connectionTimeout: 3000
		});
	}

	const consumer = kafka.consumer({
		groupId: "scheduler-agent",
	});
	await consumer.connect();
	await consumer.subscribe({
		topic,
	});
	await consumer.run({
		eachMessage: (payload) => onMessage(payload.message),
	});
	console.log("consumer connected to kafka");
	return consumer;
}

export async function disconnectKafkaConsumer(consumer: Consumer) {
	await consumer.disconnect();
	console.log("disconnected consumer from kafka");
}
