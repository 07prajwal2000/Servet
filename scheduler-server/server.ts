import { Hono } from "hono";
import { BuildScheduleHandler } from "./routes/build/handler";
import { TrackBuildHandler } from "./routes/track/handler";
import { mapUIRoutes } from "./routes/ui/controller";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();
app.post("/build", BuildScheduleHandler);
app.get("/track/:id", TrackBuildHandler);
app.use(
	"/static/*",
	serveStatic({
		root: "./routes/static/",
		rewriteRequestPath: (path: string) => path.replace(/^\/static/, ""),
	})
);
mapUIRoutes(app);

export default app;
