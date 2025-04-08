// repositories.js

import db from '../../config/db.js';

export class AlumnoTesisRepository {
  
  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Alumno_tesis';
      db.query(sql, (err, result) => {
        if (err) {
          console.error('Error en getAll:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }


  static async getById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Alumno_tesis WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) {
          console.error('Error en getById:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }


  static async create({ id, id_estudiante, id_tesis }) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Alumno_tesis (id, id_estudiante, id_tesis) VALUES (?, ?, ?)';
      db.query(sql, [id, id_estudiante, id_tesis], (err, result) => {
        if (err) {
          console.error('Error en create:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Alumno_tesis WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) {
          console.error('Error en delete:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
