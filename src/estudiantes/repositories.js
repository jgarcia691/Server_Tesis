import db from '../../config/db.js';

export class EstudianteRepository {
  
  static async getAll() {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM Estudiante',
      });
      return result.rows;
    } catch (err) {
      console.error('Error en EstudianteRepository.getAll:', err.message);
      throw err;
    }
  }

  static async getByCi(ci) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM Estudiante WHERE ci = ?',
        args: [ci],
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error('Error en EstudianteRepository.getByCi:', err.message);
      throw err;
    }
  }

  static async create({ ci, nombre, apellido, email, telefono }) {
    try {
      const result = await db.execute({
        sql: 'INSERT INTO Estudiante (ci, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?)',
        args: [ci, nombre, apellido, email, telefono],
      });
      return result;
    } catch (err) {
      console.error('Error en EstudianteRepository.create:', err.message);
      throw err;
    }
  }

  static async update(ci, { nombre, apellido, email, telefono }) {
    try {
      const result = await db.execute({
        sql: 'UPDATE Estudiante SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE ci = ?',
        args: [nombre, apellido, email, telefono, ci],
      });
      return result;
    } catch (err) {
      console.error('Error en EstudianteRepository.update:', err.message);
      throw err;
    }
  }

  static async delete(ci) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM Estudiante WHERE ci = ?',
        args: [ci],
      });
      return result;
    } catch (err) {
      console.error('Error en EstudianteRepository.delete:', err.message);
      throw err;
    }
  }

}
