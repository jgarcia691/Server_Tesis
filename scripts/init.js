import { initDb } from "../config/initDb.js";
import db from "../config/db.js";

async function runInit() {
  try {
    console.log("Iniciando la inicialización de la base de datos...");
    await initDb();
    console.log("Base de datos inicializada correctamente.");
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err.message);
  } finally {
    await db.close();
  }
}

runInit();
