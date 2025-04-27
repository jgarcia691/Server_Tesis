import db from '../../config/db.js';


export class ProfesorRepository {

  static async getAll() {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Profesor",
      });
      return result.rows;
    } catch (err) {
      console.error('Error en ProfesorRepository.getAll:', err.message);
      throw err;
    }
  }

  static async getProfesor(ci) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM Profesor WHERE ci = ?",
        args: [ci],
      });
      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      console.error('Error en ProfesorRepository.getProfesor:', err.message);
      throw err;
    }
  }

  static async create({ ci, nombre, apellido, email, telefono }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO Profesor (ci, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?)",
        args: [ci, nombre, apellido, email, telefono],
      });
      return result;
    } catch (err) {
      console.error('Error en ProfesorRepository.create:', err.message);
      throw err;
    }
  }

  static async delete(ci) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM Profesor WHERE ci = ?",
        args: [ci],
      });
      return result;
    } catch (err) {
      console.error('Error en ProfesorRepository.delete:', err.message);
      throw err;
    }
  }
}
