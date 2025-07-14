import { Kafka, logLevel } from "kafkajs";
import "dotenv/config";
import Dockerode from "dockerode";

const docker = new Dockerode({
  socketPath: "/var/run/docker.sock",
});

(async () => {
  const kafka = new Kafka({
    brokers: process.env.KAFKA_BROKERS.split(","),
    clientId: 'scheduler-controller',
    logLevel: logLevel.ERROR,
    connectionTimeout: 3000
  });
  const consumer = await kafka.consumer({
    groupId: 'group-1',
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_NODE_TOPIC,
    fromBeginning: true,
  });
  await consumer.on("consumer.connect", () => console.log("connected"));
  await consumer.run({
    async eachMessage({ message }) {
      await processNodeApp(JSON.parse(message.value.toString()));
    }
  });
})();

async function processNodeApp(msg) {
  const image = 'cnode-builder';
  const secrets = {
    clickhouseHost: "host.docker.internal",
    clickhousePort: 8123,
    clickhouseUser: "default",
    clickhousePassword: "",
    clickhouseDatabase: "monitoring",
    postgresConnection: process.env.POSTGRES_CONN ?? "",
    redisConnection: process.env.REDIS_CONN ?? "",
    S3_KEY: process.env.S3_KEY,
    S3_SECRET: process.env.S3_SECRET,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
  };

  const nodeContainer = await docker.createContainer({
    Image: image,
    HostConfig: {
      AutoRemove: true,
      CpuQuota: 5 * 10_000, // .5
      Memory: 512 * 1024 * 1024, // 512 MB
    },
    Tty: true,
    Cmd: ["120", btoa(JSON.stringify(msg)), btoa(JSON.stringify(secrets))]
  });
  
  await nodeContainer.start({
    abortSignal: AbortSignal.timeout(1000 * 72), // 72 sec timeout
  });  
  console.log("Container started with id:", nodeContainer.id);
}