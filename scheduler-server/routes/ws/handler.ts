import { Server } from "socket.io";
import { redis } from "../../lib/redis";
import { FetchPendingBuild } from "./service";

export async function WebsocketHandler(io: Server) {
	io.on("connection", (socket) => {
		let connected = false;
		let id: any = "";
		const timeoutId = setTimeout(() => {
			if (socket.disconnected) return;
			socket.disconnect();
		}, 1000 * 60 * 60 * 10); // 10 minutes

		socket.on("listen", async (msg) => {
			if (connected) return;
			id = parseInt(msg?.id || 0);
			if (!id) {
				socket.emit("error", "Invalid id");
				console.log("client kicked out", socket.id);
				socket.disconnect();
				return;
			}
			const pendingBuild = await FetchPendingBuild(id);
			if (!pendingBuild) {
				socket.emit("error", "Build not found");
				socket.disconnect();
				return;
			}
			socket.emit("build-status", pendingBuild);
			connected = true;
			const ch = `notify_${id}`;
			await redis.subscribe(ch);
			await redis.on("message", (channel, message) => {
				if (channel != ch) return;
				socket.emit("status", message);
			});
		});

		socket.on("disconnect", () => {
			clearTimeout(timeoutId);
			if (!connected) return;
			redis.unsubscribe(`build:${id.toString()}`);
		});
	});
}
