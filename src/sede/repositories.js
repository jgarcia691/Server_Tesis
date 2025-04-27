import db from '../../config/db.js';

export class SedeRepository {

    static async getAll() {
        try {
            const result = await db.execute({
                sql: 'SELECT * FROM Sede',
            });
            return result.rows;
        } catch (err) {
            console.error('Error en SedeRepository.getAll:', err.message);
            throw err;
        }
    }
  
    static async getById(id) {
        try {
            const result = await db.execute({
              sql: 'SELECT * FROM Sede WHERE id = ?',
              args: [id],
            });
            return result.rows.length > 0 ? result.rows[0] : null;
          } catch (err) {
            console.error('Error en SedeRepository.getById:', err.message);
            throw err;
          }
    }
  
    static async create({ id, nombre, Direccion, telefono }) {
      try {
        // Validación simple
        if (!id || !nombre || !Direccion || !telefono) {
          throw new Error('Todos los campos son obligatorios.');
        }
        
        const sql = "INSERT INTO Sede (id, nombre, Direccion, telefono) VALUES (?, ?, ?, ?)";
        const result = await db.execute(sql, [id, nombre, Direccion, telefono]);
        
        // Verificar qué contiene el resultado
        console.log('Resultado de la inserción:', result);  // Agregado para ver el resultado exacto
        return result;  // Retorna el resultado de la inserción
      } catch (error) {
        console.error('Error en SedeRepository.create:', error.message);
        throw error;
      }
    }
  
    static async delete(id) {
      try {
        const sql = "DELETE FROM Sede WHERE id = ?";
        const result = await db.execute(sql, [id]);
        
        // Verificar qué contiene el resultado
        console.log('Resultado de la eliminación:', result);  // Agregado para ver el resultado exacto
        
        if (result.affectedRows === 0) {
          throw new Error('No se encontró una sede con ese ID para eliminar.');
        }
        return result;  // Retorna el resultado de la eliminación
      } catch (error) {
        console.error('Error en SedeRepository.delete:', error.message);
        throw error;
      }
    }
  }
  