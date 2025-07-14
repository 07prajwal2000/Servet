import postgres, { Sql } from "postgres";

export let SQL: Sql;

export async function initalizePostgres() {
  SQL = postgres(process.env.POSTGRES_CONN ?? "");
  const row = await SQL`
    SELECT 1 as connected;
  `;
  if (row[0].connected == '1') {
    console.log("Connected to postgres");
    return true;
  }
  return false;
}