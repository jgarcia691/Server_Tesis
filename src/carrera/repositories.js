import db from '../../config/db.js';

export class CarreraRepository {

    static async getAll() {
        return new Promise((resolve, reject) => {
          const sql = "SELECT * FROM Carrera";
          db.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

    static async getCarrera(codigo) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Carrera WHERE codigo = ?";
            db.query(sql, [codigo], (err, result) => {
                if (err) return reject(err);
                resolve(result.length ? result[0] : null);
            });
        });
    }

    static async create({ codigo, nombre, campo}) {
        return new Promise((resolve, reject) => {
          const sql = "INSERT INTO Carrera (codigo, nombre, campo) VALUES (?, ?, ?)";
          db.query(sql, [codigo, nombre, campo], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

    static async delete(codigo) {
        return new Promise((resolve, reject) => {
          const sql = "DELETE FROM Carrera WHERE codigo = ?";
          db.query(sql, [codigo], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

}