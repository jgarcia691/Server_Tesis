import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EstudianteRepository {
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
      console.error("Error en EstudianteRepository.getAll:", err.message);
      throw err;
    }
  }

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
      console.error("Error en EstudianteRepository.getByCi:", err.message);
      throw err;
    }
  }

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
      console.error("Error en EstudianteRepository.create:", err.message);
      throw err;
    }
  }

  static async update(ci, { ci_type, nombre, apellido, email, telefono }) {
    const trx = await db.transaction(); // Iniciar transacción
    try {
      await trx.execute({
        // Usar trx.execute
        sql: "UPDATE Persona SET ci_type = ?, nombre = ?, apellido = ?, email = ?, telefono = ? WHERE ci = ?",
        args: [ci_type, nombre, apellido, email, telefono, ci],
      });
      // No hay campos específicos en Estudiante para actualizar, solo la Persona.
      await trx.commit(); // Confirmar transacción
      return { success: true };
    } catch (err) {
      await trx.rollback(); // Revertir transacción en caso de error
      console.error("Error en EstudianteRepository.update:", err.message);
      throw err;
    }
  }

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
      console.error("Error en EstudianteRepository.delete:", err.message);
      throw err;
    }
  }
}
