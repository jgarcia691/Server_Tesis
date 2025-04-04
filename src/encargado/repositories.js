import db from '../../config/db.js';

export class EncargadoRepository {

    
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Encargado";
            db.query(sql, (err, result) => {
                if (err) {
                    console.error('Error en getAll:', err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

   
    static async create({ ci, nombre, apellido, telefono, password, email }) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO Encargado (ci, nombre, apellido, telefono, password, email) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(sql, [ci, nombre, apellido, telefono, password, email], (err, result) => {
                if (err) {
                    console.error('Error en create:', err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    
    static async update(ci, { nombre, apellido, telefono, password, email }) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE Encargado SET nombre = ?, apellido = ?, telefono = ?, password = ?, email = ? WHERE ci = ?";
            db.query(sql, [nombre, apellido, telefono, password, email, ci], (err, result) => {
                if (err) {
                    console.error('Error en update:', err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

   
    static async delete(ci) {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM Encargado WHERE ci = ?";
            db.query(sql, [ci], (err, result) => {
                if (err) {
                    console.error('Error en delete:', err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
}
