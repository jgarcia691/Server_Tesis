import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CarreraRepository {
  /**
   * Obtiene todas las carreras.
   * @returns {Promise<Array>} Lista de carreras.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Carrera",
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraRepository.getAll:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Obtiene una carrera por su código.
   * @param {number} codigo - Código de la carrera.
   * @returns {Promise<Object|null>} Carrera o null.
   */
  static async getCarrera(codigo) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Carrera WHERE codigo = ?",
        args: [codigo],
      });
      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraRepository.getCarrera:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea una nueva carrera.
   * @param {Object} params - Datos de la carrera.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ codigo, nombre, campo }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO Carrera (codigo, nombre, campo) VALUES (?, ?, ?)",
        args: [codigo, nombre, campo],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraRepository.create:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Elimina una carrera.
   * @param {number} codigo - Código de la carrera.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(codigo) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM Carrera WHERE codigo = ?",
        args: [codigo],
      });
      return result;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en CarreraRepository.delete:",
        err.message,
      );
      throw err;
    }
  }
}
