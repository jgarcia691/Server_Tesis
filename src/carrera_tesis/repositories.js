// repositories.js

import db from '../../config/db.js';

export class CarreraTesisRepository {

  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Carrera_tesis';
      db.query(sql, (err, result) => {
        if (err) {
          console.error('Error en getAll:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async create({ id, id_carrera, id_tesis }) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Carrera_tesis (id, id_carrera, id_tesis) VALUES (?, ?, ?)';
      db.query(sql, [id, id_carrera, id_tesis], (err, result) => {
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
      const sql = 'DELETE FROM Carrera_tesis WHERE id = ?';
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
