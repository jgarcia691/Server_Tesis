import db from '../../config/db.js';

export class AlumnoCarreraRepository {

  static async getAll() {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM Alumno_carrera',
      });
      return result.rows;
    } catch (err) {
      console.error('Error en getAll:', err.message);
      throw err;
    }
  }

  static async getByCodigo(codigo) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM Alumno_carrera WHERE codigo = ?',
        args: [codigo],
      });
      return result.rows;
    } catch (err) {
      console.error('Error en getByCodigo:', err.message);
      throw err;
    }
  }

  static async create({ codigo, id_estudiante, id_carrera }) {
    try {
      const result = await db.execute({
        sql: `
          INSERT INTO Alumno_carrera (codigo, id_estudiante, id_carrera)
          VALUES (?, ?, ?)
        `,
        args: [codigo, id_estudiante, id_carrera],
      });
      return result;
    } catch (err) {
      console.error('Error en create:', err.message);
      throw err;
    }
  }

  static async delete(codigo) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM Alumno_carrera WHERE codigo = ?',
        args: [codigo],
      });
      return result;
    } catch (err) {
      console.error('Error en delete:', err.message);
      throw err;
    }
  }

}
