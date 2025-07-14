import { serve } from "@hono/node-server";
import app from "./server";
import "dotenv/config";
import { disconnectKafka, initializeProducer } from "./lib/kafka";
import { Server } from "socket.io";
import { WebsocketHandler } from "./routes/ws/handler";
import { initializeRedis } from "./lib/redis";
import { initalizePostgres } from "./lib/postgres";

async function main() {
  await initializeProducer();
  await initalizePostgres();
  await initializeRedis();
  process.on("SIGINT", handleQuit);
  process.on("SIGTERM", handleQuit);
  process.on("uncaughtException", handleQuit);
  const server = serve({
    fetch: app.fetch,
    port: 8000,
  }, (info) => {
    console.log(`scheduler server listening on port ${info.port}`);
  });
  const socketio = new Server(server, {
    cors: {
      allowedHeaders: ['*'],
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST'],
    }
  });
  await WebsocketHandler(socketio);
}

async function handleQuit() {
  await disconnectKafka();
}

main();