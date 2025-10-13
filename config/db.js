import { createClient } from "@libsql/client";
import { loadEnv } from "../config/load_env.js";

loadEnv();

console.log("Connecting to Turso DB URL:", process.env.TURSO_DB_URL);
console.log("Turso Auth Token (first 5 chars):", process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.substring(0, 5) : "Not set");

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;
