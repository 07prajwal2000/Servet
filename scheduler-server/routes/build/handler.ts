import { Context } from "hono";
import { schema, validateData } from "./schema";
import { scheduleBuildServer } from "./service";

export async function BuildScheduleHandler(ctx: Context) {
	const isJson = ctx.req.header("content-type") === "application/json";
	const body = isJson ? await ctx.req.json() : await ctx.req.parseBody();
	const parsed = schema.safeParse(body);

	if (!parsed.success || !validateData(body)) {
		return ctx.json(
			{
				message: "Invalid data",
			},
			400
		);
	}
	try {
		const response = await scheduleBuildServer(parsed.data);
		if (!isJson) {
			return ctx.redirect(`/track?buildId=${response.data?.buildId}`);
		}
		return ctx.json(response, response.data ? 200 : 400);
	} catch (error) {
		console.log("SERVER ERROR", error);
		if (!isJson) return ctx.redirect(`/?message=Server Error Occured`);
		return ctx.json(
			{
				message: "Server error",
			},
			500
		);
	}
}
