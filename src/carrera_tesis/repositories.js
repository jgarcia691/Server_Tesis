import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// repositories.js

import db from "../../config/db.js";

export class CarreraTesisRepository {
  /**
   * Obtiene todos los registros.
   * @returns {Promise<Array>} Lista de registros.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Carrera_tesis",
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraTesisRepository.getAll:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea una asociación carrera-tesis.
   * @param {Object} params - Datos del registro.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ id, id_carrera, id_tesis }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO Carrera_tesis (id, id_carrera, id_tesis) VALUES (?, ?, ?)",
        args: [id, id_carrera, id_tesis],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraTesisRepository.create:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Elimina una asociación carrera-tesis.
   * @param {number} id - ID del registro.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM Carrera_tesis WHERE id = ?",
        args: [id],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraTesisRepository.delete:",
        err.message,
      );
      throw err;
    }
  }
}
