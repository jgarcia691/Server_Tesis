import db from '../../config/db.js';

export class EstudianteRepository {
  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Estudiante';
      db.query(sql, (err, result) => {
        if (err) {
          console.error('Error en EstudianteRepository.getAll:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async getByCi(ci) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Estudiante WHERE ci = ?';
      db.query(sql, [ci], (err, result) => {
        if (err) {
          console.error('Error en EstudianteRepository.getByCi:', err.message);
          return reject(err);
        }
        resolve(result.length > 0 ? result[0] : null);
      });
    });
  }

  static async create({ ci, nombre, apellido, email, telefono }) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Estudiante (ci, nombre, apellido, email, telefono) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [ci, nombre, apellido, email, telefono], (err, result) => {
        if (err) {
          console.error('Error en EstudianteRepository.create:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async update(ci, { nombre, apellido, email, telefono }) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE Estudiante SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE ci = ?';
      db.query(sql, [nombre, apellido, email, telefono, ci], (err, result) => {
        if (err) {
          console.error('Error en EstudianteRepository.update:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async delete(ci) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Estudiante WHERE ci = ?';
      db.query(sql, [ci], (err, result) => {
        if (err) {
          console.error('Error en EstudianteRepository.delete:', err.message);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
