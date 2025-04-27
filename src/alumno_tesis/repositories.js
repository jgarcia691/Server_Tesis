// repositories.js

import db from '../../config/db.js';

export class AlumnoTesisRepository {

  static async getAll() {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM Alumno_tesis',
      });
      return result.rows;
    } catch (err) {
      console.error('Error en getAll:', err.message);
      throw err;
    }
  }

  static async getById(id) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM Alumno_tesis WHERE id = ?',
        args: [id],
      });
      return result.rows;
    } catch (err) {
      console.error('Error en getById:', err.message);
      throw err;
    }
  }

  static async create({ id_estudiante, id_tesis }) {
    try {
      const result = await db.execute({
        sql: 'INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)',
        args: [id_estudiante, id_tesis],
      });
      return result;
    } catch (err) {
      console.error('Error en create:', err.message);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM Alumno_tesis WHERE id = ?',
        args: [id],
      });
      return result;
    } catch (err) {
      console.error('Error en delete:', err.message);
      throw err;
    }
  }

}
