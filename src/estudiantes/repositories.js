import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EstudianteRepository {
  /**
   * Obtiene todos los estudiantes.
   * @returns {Promise<Array>} Lista de estudiantes.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: `
          SELECT p.ci, p.nombre, p.apellido, p.email, p.telefono
          FROM Persona p
          JOIN Estudiante e ON p.ci = e.estudiante_ci
        `,
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en EstudianteRepository.getAll:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Obtiene un estudiante por CI.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object|null>} Estudiante o null.
   */
  static async getByCi(ci) {
    try {
      const result = await db.execute({
        sql: `
          SELECT p.ci, p.nombre, p.apellido, p.email, p.telefono
          FROM Persona p
          JOIN Estudiante e ON p.ci = e.estudiante_ci
          WHERE p.ci = ?
        `,
        args: [ci],
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en EstudianteRepository.getByCi:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea un nuevo estudiante.
   * @param {Object} params - Datos del estudiante.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  static async create({ ci, ci_type, nombre, apellido, email, telefono }) {
    const trx = await db.transaction();
    try {
      await trx.execute({
        sql: "INSERT INTO Persona (ci, ci_type, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?, ?)",
        args: [ci, ci_type, nombre, apellido, email, telefono],
      });
      await trx.execute({
        sql: "INSERT INTO Estudiante (estudiante_ci) VALUES (?)",
        args: [ci],
      });
      await trx.commit();
      return { success: true };
    } catch (err) {
      await trx.rollback();
      console.error(
        "DEPURACIÓN: Error en EstudianteRepository.create:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Actualiza los datos de un estudiante.
   * @param {number} ci - Cédula de identidad.
   * @param {Object} params - Datos a actualizar.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  static async update(ci, { ci_type, nombre, apellido, email, telefono }) {
    const trx = await db.transaction();
    try {
      await trx.execute({
        sql: "UPDATE Persona SET ci_type = ?, nombre = ?, apellido = ?, email = ?, telefono = ? WHERE ci = ?",
        args: [ci_type, nombre, apellido, email, telefono, ci],
      });
      await trx.commit();
      return { success: true };
    } catch (err) {
      await trx.rollback();
      console.error(
        "DEPURACIÓN: Error en EstudianteRepository.update:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Elimina un estudiante.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(ci) {
    const trx = await db.transaction();
    try {
      await trx.execute({
        sql: "DELETE FROM Estudiante WHERE estudiante_ci = ?",
        args: [ci],
      });
      await trx.execute({
        sql: "DELETE FROM Persona WHERE ci = ?",
        args: [ci],
      });
      await trx.commit();
      return { success: true };
    } catch (err) {
      await trx.rollback();
      console.error(
        "DEPURACIÓN: Error en EstudianteRepository.delete:",
        err.message,
      );
      throw err;
    }
  }
}
