import { createClient } from "@libsql/client";
import { loadEnv } from "../config/load_env.js";

loadEnv();

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;
