import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "@/env.js";

import * as schema from "./schema.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export default db;
