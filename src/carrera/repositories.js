import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CarreraRepository {
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Carrera",
      });
      return result.rows;
    } catch (err) {
      console.error("Error en getAll:", err.message);
      throw err;
    }
  }

  static async getCarrera(codigo) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Carrera WHERE codigo = ?",
        args: [codigo],
      });
      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      console.error("Error en getCarrera:", err.message);
      throw err;
    }
  }

  static async create({ codigo, nombre, campo }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO Carrera (codigo, nombre, campo) VALUES (?, ?, ?)",
        args: [codigo, nombre, campo],
      });
      return result;
    } catch (err) {
      console.error("Error en create:", err.message);
      throw err;
    }
  }

  static async delete(codigo) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM Carrera WHERE codigo = ?",
        args: [codigo],
      });
      return result;
    } catch (err) {
      console.error("Error en delete:", err.message);
      throw err;
    }
  }
}
