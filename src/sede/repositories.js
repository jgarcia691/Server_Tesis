import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../../config/db.js";

export class SedeRepository {
  /**
   * Obtiene todas las sedes.
   * @returns {Promise<Array>} Lista de sedes.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Sede",
      });
      return result.rows;
    } catch (err) {
      console.error("DEPURACIÓN: Error en SedeRepository.getAll:", err.message);
      throw err;
    }
  }

  /**
   * Obtiene una sede por ID.
   * @param {number} id - ID de la sede.
   * @returns {Promise<Object|null>} Sede o null.
   */
  static async getById(id) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Sede WHERE id = ?",
        args: [id],
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en SedeRepository.getById:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea una nueva sede.
   * @param {Object} params - Datos de la sede.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ id, nombre, direccion, telefono }) {
    try {
      // Validación simple
      if (!id || !nombre || !direccion || !telefono) {
        throw new Error("Todos los campos son obligatorios.");
      }

      const sql =
        "INSERT INTO Sede (id, nombre, direccion, telefono) VALUES (?, ?, ?, ?)";
      const result = await db.execute(sql, [id, nombre, direccion, telefono]);

      // Verificar qué contiene el resultado
      console.log("DEPURACIÓN: Resultado de la inserción:", result); // Agregado para ver el resultado exacto
      return result; // Retorna el resultado de la inserción
    } catch (error) {
      console.error(
        "DEPURACIÓN: Error en SedeRepository.create:",
        error.message,
      );
      throw error;
    }
  }

  /**
   * Elimina una sede.
   * @param {number} id - ID de la sede.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id) {
    try {
      const sql = "DELETE FROM Sede WHERE id = ?";
      const result = await db.execute(sql, [id]);

      // Verificar qué contiene el resultado
      console.log("DEPURACIÓN: Resultado de la eliminación:", result); // Agregado para ver el resultado exacto

      if (result.affectedRows === 0) {
        throw new Error("No se encontró una sede con ese ID para eliminar.");
      }
      return result; // Retorna el resultado de la eliminación
    } catch (error) {
      console.error(
        "DEPURACIÓN: Error en SedeRepository.delete:",
        error.message,
      );
      throw error;
    }
  }
}
