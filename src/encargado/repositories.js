import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EncargadoRepository {
  /**
   * Obtiene todos los encargados de la BD.
   * @returns {Promise<Array>} Lista de encargados.
   */
  static async getAll() {
    try {
      const result = await db.execute({
        sql: `
          SELECT p.ci, p.nombre, p.apellido, p.email, p.telefono, e.id_sede
          FROM Persona p
          JOIN Encargado e ON p.ci = e.encargado_ci
        `,
      });
      return result.rows;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en EncargadoRepository.getAll:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Obtiene un encargado por CI de la BD.
   * @param {number} ci - CI del encargado.
   * @returns {Promise<Object|null>} El encargado o null.
   */
  static async getEncargado(ci) {
    try {
      const result = await db.execute({
        sql: `
          SELECT p.ci, p.nombre, p.apellido, p.email, p.telefono, e.id_sede
          FROM Persona p
          JOIN Encargado e ON p.ci = e.encargado_ci
          WHERE p.ci = ?
        `,
        args: [ci],
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(
        "DEPURACIÓN: Error en EncargadoRepository.getEncargado:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Crea un encargado en la BD (inserta en Persona y en Encargado).
   * @param {Object} params - Datos del encargado.
   * @returns {Promise<Object>} Resultado exitoso.
   */
  static async create({
    ci,
    ci_type,
    nombre,
    apellido,
    email,
    telefono,
    id_sede,
  }) {
    const trx = await db.transaction();
    try {
      await trx.execute({
        sql: "INSERT INTO Persona (ci, ci_type, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?, ?)",
        args: [ci, ci_type, nombre, apellido, email, telefono],
      });
      await trx.execute({
        sql: "INSERT INTO Encargado (encargado_ci, id_sede) VALUES (?, ?)",
        args: [ci, id_sede],
      });
      await trx.commit();
      return { success: true };
    } catch (err) {
      await trx.rollback();
      console.error(
        "DEPURACIÓN: Error en EncargadoRepository.create:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Actualiza los datos de un encargado.
   * @param {number} ci - CI del encargado.
   * @param {Object} params - Datos a actualizar.
   * @returns {Promise<Object>} Resultado exitoso.
   */
  static async update(ci, { nombre, apellido, email, telefono, id_sede }) {
    const trx = await db.transaction();
    try {
      await trx.execute({
        sql: "UPDATE Persona SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE ci = ?",
        args: [nombre, apellido, email, telefono, ci],
      });
      await trx.execute({
        sql: "UPDATE Encargado SET id_sede = ? WHERE encargado_ci = ?",
        args: [id_sede, ci],
      });
      await trx.commit();
      return { success: true };
    } catch (err) {
      await trx.rollback();
      console.error(
        "DEPURACIÓN: Error en EncargadoRepository.update:",
        err.message,
      );
      throw err;
    }
  }

  /**
   * Elimina un encargado de la BD.
   * @param {number} ci - CI del encargado.
   * @returns {Promise<Object>} Resultado exitoso.
   */
  static async delete(ci) {
    const trx = await db.transaction();
    try {
      await trx.execute({
        sql: "DELETE FROM Encargado WHERE encargado_ci = ?",
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
        "DEPURACIÓN: Error en EncargadoRepository.delete:",
        err.message,
      );
      throw err;
    }
  }
}
