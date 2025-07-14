import { hashId } from "../../lib/hashid";
import { SQL } from "../../lib/postgres";
import { BuildSchedule } from "../build/schema";

export async function FindBuildStatus(id: string) {
	const decodedId = hashId.decode(id)[0];
  if (!decodedId) return {
    data: null,
    message: 'Invalid ID'
  };
	const build = await SQL<
		BuildSchedule[]
	>`SELECT * FROM build WHERE id = ${decodedId.toString()}`;
	if (build.length == 0) return {
    data: null,
    message: 'Not found'
  };
	return {
    data: build[0],
    message: ''
  };
}
