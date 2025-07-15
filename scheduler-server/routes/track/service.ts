import { SQL } from "../../lib/postgres";
import { BuildSchedule } from "../build/schema";

export async function FindBuildStatus(id: string) {
	const idNum = parseInt(id);

	if (isNaN(idNum) || idNum <= 0)
		return {
			data: null,
			message: "Invalid ID",
		};

	const build = await SQL<
		BuildSchedule[]
	>`SELECT * FROM build_schedule WHERE id = ${idNum}`;

	if (build.length == 0)
		return {
			data: null,
			message: "Not found",
		};

	return {
		data: build[0],
		message: "",
	};
}
