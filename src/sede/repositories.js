import db from '../../config/db.js';

export class SedeRepository {

    
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Sede";
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
            const sql = "SELECT * FROM Sede WHERE id = ?";
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result.length ? result[0] : null);
            });
        });
    }

    
    static async create(data) {
        try {
            const { id, nombre, Direccion, telefono } = data;
            if (!id || !nombre || !Direccion || !telefono) {
                throw new Error('Todos los campos son obligatorios: id, nombre, Direccion, telefono.');
            }

            if (
                typeof id !== 'number' ||isNaN(id) ||typeof telefono !== 'string' ||typeof nombre !== 'string' || typeof Direccion !== 'string'
            ) {
                throw new Error('id y telefono deben ser números válidos; nombre y Direccion deben ser cadenas.');
            }

            console.log('Ejecutando consulta para crear una nueva sede con los datos:', data);
            const query = 'INSERT INTO Sede (id, nombre, Direccion, telefono) VALUES (?, ?, ?, ?)';
            await db.query(query, [id, nombre, Direccion, telefono]);
            console.log('Sede creada exitosamente.');
            return { message: 'Sede creada con éxito' };
        } catch (error) {
            console.error('Error en SedeRepository.create:', error.message);
            throw new Error('No se pudo crear la sede: ' + error.message);
        }
    }

    
    static async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM Sede WHERE id = ?";
            db.query(sql, [id], (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });
    }
}
