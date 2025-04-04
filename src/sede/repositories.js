const db = require('./config/database');

export class SedeRepository {

    
    static async getAll() {
        try {
            const query = 'SELECT * FROM Sede';
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            console.error('Error en SedeRepository.getAll:', error.message);
            throw new Error('No se pudieron obtener las sedes.');
        }
    }

    
    static async getById(id) {
        try {
            if (!id || typeof id !== 'number' || isNaN(id)) {
                throw new Error('El campo id es obligatorio y debe ser un número válido.');
            }

            console.log(`Ejecutando consulta para obtener la sede con ID: ${id}`);
            const query = 'SELECT * FROM Sede WHERE id = ?';
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? rows[0] : null; // Si no se encuentra, devuelve null
        } catch (error) {
            console.error('Error en SedeRepository.getById:', error.sqlMessage || error.message);
            throw new Error('No se pudo obtener la sede.');
        }
    }

    
    static async create(data) {
        try {
            const { id, nombre, Direccion, telefono } = data;
            if (!id || !nombre || !Direccion || !telefono) {
                throw new Error('Todos los campos son obligatorios: id, nombre, Direccion, telefono.');
            }

            if (
                typeof id !== 'number' ||isNaN(id) ||typeof telefono !== 'number' ||typeof nombre !== 'string' || typeof Direccion !== 'string'
            ) {
                throw new Error('id y telefono deben ser números válidos; nombre y Direccion deben ser cadenas.');
            }

            console.log('Ejecutando consulta para crear una nueva sede con los datos:', data);
            const query = 'INSERT INTO Sede (id, nombre, Direccion, telefono) VALUES (?, ?, ?, ?)';
            await db.execute(query, [id, nombre, Direccion, telefono]);
            console.log('Sede creada exitosamente.');
            return { message: 'Sede creada con éxito' };
        } catch (error) {
            console.error('Error en SedeRepository.create:', error.message);
            throw new Error('No se pudo crear la sede: ' + error.message);
        }
    }

    
    static async delete(id) {
        try {
            if (!id || typeof id !== 'number' || isNaN(id)) {
                throw new Error('El campo id es obligatorio y debe ser un número válido.');
            }

            console.log(`Ejecutando consulta para eliminar la sede con ID: ${id}`);
            const query = 'DELETE FROM Sede WHERE id = ?';
            await db.execute(query, [id]);
            console.log('Sede eliminada exitosamente.');
            return { message: 'Sede eliminada con éxito' };
        } catch (error) {
            console.error('Error en SedeRepository.delete:', error.message);
            throw new Error('No se pudo eliminar la sede: ' + error.message);
        }
    }
}