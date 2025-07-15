import { Context } from "hono";
import { FindBuildStatus } from "./service";

export async function TrackBuildHandler(ctx: Context) {
	const { id } = ctx.req.param();
	
	try {
		const buildStatus = await FindBuildStatus(id);
		return ctx.json(buildStatus, buildStatus.data ? 200 : 404);
	} catch (error) {
		return ctx.json({ message: "Server error" }, 500);
	}
}
