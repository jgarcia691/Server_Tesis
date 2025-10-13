import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../../config/db.js";

export class EncargadoRepository {
  static async getAll() {
    try {
      const sql = "SELECT * FROM Encargado;";
      const result = await db.execute(sql);
      return result.rows; // devuelve solo los datos
    } catch (err) {
      console.error("Error en getAll:", err.message);
      throw err;
    }
  }

  static async getEncargado(ci) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Encargado WHERE ci = ?",
        args: [ci],
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error("Error en getEncargado:", err.message);
      throw err;
    }
  }

  static async create({
    ci,
    nombre,
    apellido,
    telefono,
    email,
    id_sede,
  }) {
    try {
      const sql = `
        INSERT INTO Encargado (ci, nombre, apellido, telefono, email, id_sede)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *;
      `;
      const result = await db.execute({
        sql,
        args: [ci, nombre, apellido, telefono, email, id_sede],
      });
      return result.rows[0]; // devuelve el nuevo encargado insertado
    } catch (err) {
      console.error("Error en create:", err.message);
      throw err;
    }
  }

  static async update(
    ci,
    { nombre, apellido, telefono, password, email, id_sede },
  ) {
    try {
      const sql = `
        UPDATE Encargado
        SET nombre = ?, apellido = ?, telefono = ?, password = ?, email = ?, id_sede = ?
        WHERE ci = ?
        RETURNING *;
      `;
      const result = await db.execute({
        sql,
        args: [nombre, apellido, telefono, password, email, id_sede, ci],
      });
      return result.rows[0]; // devuelve el encargado actualizado
    } catch (err) {
      console.error("Error en update:", err.message);
      throw err;
    }
  }

  static async delete(ci) {
    try {
      const sql = "DELETE FROM Encargado WHERE ci = ? RETURNING *;";
      const result = await db.execute({
        sql,
        args: [ci],
      });
      return result.rows[0] || null; // devuelve el encargado eliminado o null
    } catch (err) {
      console.error("Error en delete:", err.message);
      throw err;
    }
  }
}
