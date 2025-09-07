// repositories.js

import db from "../../config/db.js";

export class CarreraTesisRepository {
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Carrera_tesis",
      });
      return result.rows;
    } catch (err) {
      console.error("Error en getAll:", err.message);
      throw err;
    }
  }

  static async create({ id, id_carrera, id_tesis }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO Carrera_tesis (id, id_carrera, id_tesis) VALUES (?, ?, ?)",
        args: [id, id_carrera, id_tesis],
      });
      return result;
    } catch (err) {
      console.error("Error en create:", err.message);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM Carrera_tesis WHERE id = ?",
        args: [id],
      });
      return result;
    } catch (err) {
      console.error("Error en delete:", err.message);
      throw err;
    }
  }
}
