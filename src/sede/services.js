import { SedeRepository } from './repositories.js';

export class SedeService {
    
    
    static async getAll() {
        try {
            console.log('Obteniendo todas las sedes...');
            const sedes = await SedeRepository.getAll();
            console.log('Sedes obtenidas:', sedes);
            return { status: 'success', data: sedes };
        } catch (error) {
            console.error('Error en SedeService.getAll:', error.message);
            throw new Error('No se pudieron obtener las sedes.');
        }
    }

   
    static async getById(id) {
        try {
            if (!id || typeof id !== 'number' || isNaN(id)) {
                throw new Error('El campo id es obligatorio y debe ser un número válido.');
            }

            console.log(`Obteniendo sede con ID: ${id}`);
            const sede = await SedeRepository.getById(id);
            if (!sede) {
                throw new Error(`La sede con ID ${id} no existe.`);
            }
            return { status: 'success', data: sede };
        } catch (error) {
            console.error(`Error en SedeService.getById (ID: ${id}):`, error.message);
            throw new Error('No se pudo obtener la sede: ' + error.message);
        }
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

            console.log('Creando una nueva sede con los datos:', data);
            const resultado = await SedeRepository.create(data);
            console.log('Sede creada exitosamente:', resultado);
            return { status: 'success', message: 'Sede creada correctamente', data: resultado };
        } catch (error) {
            console.error('Error en SedeService.create:', error.message);
            throw new Error('No se pudo crear la sede: ' + error.message);
        }
    }

   
    static async delete(id) {
        try {
            if (!id || typeof id !== 'number' || isNaN(id)) {
                throw new Error('El campo id es obligatorio y debe ser un número válido.');
            }

            console.log(`Eliminando sede con ID: ${id}...`);
            const resultado = await SedeRepository.delete(id);
            console.log(`Sede con ID ${id} eliminada exitosamente.`);
            return { status: 'success', message: 'Sede eliminada correctamente', data: resultado };
        } catch (error) {
            console.error(`Error en SedeService.delete (ID: ${id}):`, error.message);
            throw new Error('No se pudo eliminar la sede: ' + error.message);
        }
    }
}