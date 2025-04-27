import db from '../../config/db.js';

export class EncargadoRepository {

    
    
    static async getAll() {
            try {
                const sql = "SELECT * FROM Encargado;";
                const result = await db.execute(sql);
                return result.rows;  // Aquí están los datos
            } catch (err) {
                console.error('Error en getAll:', err.message);
                throw err;
            }
    }
    
    static async create({ ci, nombre, apellido, telefono, password, email }) {
        try {
            const sql = `
                INSERT INTO Encargado (ci, nombre, apellido, telefono, password, email) 
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            const result = await db.execute({
                sql,
                args: [ci, nombre, apellido, telefono, password, email],
            });
            return result;
        } catch (err) {
            console.error('Error en create:', err.message);
            throw err;
        }
    }

    static async update(ci, { nombre, apellido, telefono, password, email }) {
        try {
            const sql = `
                UPDATE Encargado 
                SET nombre = ?, apellido = ?, telefono = ?, password = ?, email = ?
                WHERE ci = ?;
            `;
            const result = await db.execute({
                sql,
                args: [nombre, apellido, telefono, password, email, ci],
            });
            return result;
        } catch (err) {
            console.error('Error en update:', err.message);
            throw err;
        }
    }

    static async delete(ci) {
        try {
            const sql = "DELETE FROM Encargado WHERE ci = ?;";
            const result = await db.execute({
                sql,
                args: [ci],
            });
            return result;
        } catch (err) {
            console.error('Error en delete:', err.message);
            throw err;
        }
    }
}
