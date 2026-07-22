import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";

const { Pool } = pg;

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const isDbConfigured = Boolean(process.env.SQL_HOST);

export const createPool = () => {
  if (!global._postgresPool && isDbConfigured) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      connectionTimeoutMillis: 5000,
    });

    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = pool ? drizzle(pool, { schema }) : null;

