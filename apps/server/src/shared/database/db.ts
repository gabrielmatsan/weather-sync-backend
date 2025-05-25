import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env/env";

type DbInstanceType = NodePgDatabase<Record<string, never>>;

let db: DbInstanceType;

const activesPools: Pool[] = [];

if (env.NODE_ENV === "production") {
  console.log("Production environment not yet implemented ...");
  throw new Error("Production environment not yet implemented...");
} else {
  console.log("Development environment");

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const devPool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  activesPools.push(devPool);

  db = drizzle(devPool);

  console.log(
    `Database connection! \n environment: ${env.NODE_ENV || "development"}`
  );
}

export { db };

export async function shutdownPools() {
  if (activesPools.length > 0) {
    console.log(`Shutting down ${activesPools.length} database pools...`);
    await Promise.all(activesPools.map((pool) => pool.end()));
    console.log("All database pools shut down.");
  } else {
    console.log("No active database pools to shut down.");
  }
}
