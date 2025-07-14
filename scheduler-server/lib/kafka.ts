import { Admin, Kafka, logLevel, Producer } from "kafkajs";

const kafka = new Kafka({
	brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
	clientId: process.env.KAFKA_CLIENT_ID,
	logLevel: logLevel.ERROR,
});

export let kafkaProducer: Producer = null!;

export async function initializeProducer() {
	const admin = kafka.admin();
	await admin.connect();
	await createTopic(admin);
	await admin.disconnect();

	kafkaProducer = kafka.producer();
	await kafkaProducer.connect();
	console.log("Connected producer to kafka");
}

async function createTopic(admin: Admin) {
  const topics = [
    process.env.KAFKA_NODE_TOPIC!,
    process.env.KAFKA_PYTHON_TOPIC!,
    process.env.KAFKA_DOCKER_TOPIC!,
  ];
	try {
		await admin.fetchTopicMetadata({
			topics,
		});
	} catch (error) {
		await admin.createTopics({
			topics: topics.map(topic => ({
        topic,
        numPartitions: 3
      })),
			waitForLeaders: true,
		});
	}
}

export async function disconnectKafka() {
	await kafkaProducer.disconnect();
	console.log("disconnected producer from kafka");
}
