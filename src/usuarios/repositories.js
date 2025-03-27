import db from '../../config/db.js';

export class UsuarioRepository {
  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM Encargado";
      db.query(sql, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  static async create({ ci, nombre, apellido, telefono }) {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO Encargado (ci, nombre, apellido, telefono) VALUES (?, ?, ?, ?)";
      db.query(sql, [ci, nombre, apellido, telefono], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  static async update(ci, { nombre, apellido, telefono }) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE Encargado SET nombre = ?, apellido = ?, telefono = ? WHERE ci = ?";
      db.query(sql, [nombre, apellido, telefono, ci], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  static async delete(ci) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM Encargado WHERE ci = ?";
      db.query(sql, [ci], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}
