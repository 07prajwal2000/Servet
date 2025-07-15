import { SQL } from "../../lib/postgres";
import { BuildSchedule } from "../build/schema";

export async function FetchPendingBuild(id: number) {
  const buildExist = await SQL<BuildSchedule[]>`select id from build_schedule where id = ${id}`;
  if (buildExist.length == 0) return null;
  return buildExist[0];
}