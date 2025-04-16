import db from '../../config/db.js';


export class ProfesorRepository {

    static async getAll() {
        return new Promise((resolve, reject) => {
          const sql = "SELECT * FROM Profesor";
          db.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

    static async getProfesor(ci) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Profesor WHERE ci = ?";
            db.query(sql, [ci], (err, result) => {
                if (err) return reject(err);
                resolve(result.length ? result[0] : null);
            });
        });
    }

    static async create({ ci, nombre, apellido, email, telefono}) {
        return new Promise((resolve, reject) => {
          const sql = "INSERT INTO Profesor (ci, nombre, apellido, email, telefono) VALUES (?, ?, ?,?,?)";
          db.query(sql, [ci, nombre, apellido, email, telefono], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

    static async delete(ci) {
        return new Promise((resolve, reject) => {
          const sql = "DELETE FROM Profesor WHERE ci = ?";
          db.query(sql, [ci], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

}