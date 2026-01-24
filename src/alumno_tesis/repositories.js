// repositories.js

import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AlumnoTesisRepository {
  /**
   * Obtiene todos los registros.
   * @returns {Promise<Array>} Lista de registros.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Alumno_tesis",
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en AlumnoTesisRepository.getAll:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Obtiene registro por ID.
   * @param {number} id - ID del registro.
   * @returns {Promise<Array>} Registros encontrados.
   */
  static async getById(id) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Alumno_tesis WHERE id = ?",
        args: [id],
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en AlumnoTesisRepository.getById:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea una asociación alumno-tesis.
   * @param {Object} params - IDs de estudiante y tesis.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ id_estudiante, id_tesis }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)",
        args: [id_estudiante, id_tesis],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en AlumnoTesisRepository.create:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Elimina una asociación alumno-tesis.
   * @param {number} id - ID del registro.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM Alumno_tesis WHERE id = ?",
        args: [id],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en AlumnoTesisRepository.delete:",
        err.message,
      );
      throw err;
    }
  }
}
