import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../../config/db.js";

export class AlumnoCarreraRepository {
  /**
   * Obtiene todos los registros.
   * @returns {Promise<Array>} Lista de registros.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Alumno_carrera",
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en AlumnoCarreraRepository.getAll:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea una asociación alumno-carrera.
   * @param {Object} params - IDs de estudiante y carrera.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ id_estudiante, id_carrera }) {
    try {
      const result = await db.execute({
        sql: `
          INSERT INTO Alumno_carrera (id_estudiante, id_carrera)
          VALUES (?, ?)
        `,
        args: [id_estudiante, id_carrera],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en AlumnoCarreraRepository.create:",
        err.message,
      );
      throw err;
    }
  }
}
