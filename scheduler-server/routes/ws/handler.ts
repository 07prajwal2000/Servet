import { Server } from "socket.io";
import { hashId } from "../../lib/hashid";
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
      console.log(typeof msg);
      
			id = hashId.decode(msg?.id || "")[0];

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

			await redis.subscribe(`build:${id.toString()}`);

			await redis.on("message", (channel, message) => {
				if (channel != `build:${id.toString()}`) return;
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
