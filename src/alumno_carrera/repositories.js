import db from '../../config/db.js';

export class AlumnoCarreraRepository {

  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Alumno_carrera';
      db.query(sql, (err, result) => {
        if (err) {
          console.error('Error en getAll:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async getByCodigo(codigo) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Alumno_carrera WHERE codigo = ?';
      db.query(sql, [codigo], (err, result) => {
        if (err) {
          console.error('Error en getByCodigo:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
  

  static async create({ codigo, id_estudiante, id_carrera }) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO Alumno_carrera (codigo, id_estudiante, id_carrera)
        VALUES (?, ?, ?)
      `;
      db.query(sql, [codigo, id_estudiante, id_carrera], (err, result) => {
        if (err) {
          console.error('Error en create:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async delete(codigo) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Alumno_carrera WHERE codigo = ?';
      db.query(sql, [codigo], (err, result) => {
        if (err) {
          console.error('Error en delete:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}