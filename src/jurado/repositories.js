import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../../config/db.js";

export class JuradoRepository {
  /**
   * Obtiene el jurado de una tesis.
   * @param {number} id_tesis - ID de la tesis.
   * @returns {Promise<Object|null>} Jurado o null.
   */
  static async getJurado(id_tesis) {
    try {
      console.log("DEPURACIÓN: Buscando jurado para tesis:", id_tesis);
      const result = await db.execute({
        sql: "SELECT * FROM jurado WHERE id_tesis = ?",
        args: [id_tesis],
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en JuradoRepository.getJurado:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea una asignación de jurado.
   * @param {Object} params - IDs de tesis y profesor.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ id_tesis, id_profesor }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO jurado (id_tesis, id_profesor) VALUES (?, ?)",
        args: [id_tesis, id_profesor],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en JuradoRepository.create:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Elimina una asignación de jurado test.
   * @param {number} id_tesis - ID de la tesis.
   * @param {number} id_profesor - ID del profesor.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id_tesis, id_profesor) {
    try {
      console.log("DEPURACIÓN: Eliminando jurado con:", {
        id_tesis,
        id_profesor,
      });
      const result = await db.execute({
        sql: "DELETE FROM jurado WHERE id_tesis = ? AND id_profesor = ?",
        args: [id_tesis, id_profesor],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en JuradoRepository.delete:",
        err.message,
      );
      throw err;
    }
  }
}
