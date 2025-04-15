import { EncargadoRepository } from './repositories.js';

export class EncargadoService {

    
    static async getAll() {
        try {
            console.log('Obteniendo todos los encargados...');
            const encargados = await EncargadoRepository.getAll();
            console.log('Encargados obtenidos:', encargados);
            return { status: 'success', data: encargados };
        } catch (error) {
            console.error('Error al obtener encargados:', error.message);
            throw new Error('No se pudieron obtener los encargados.');
        }
    }

    
    static async create(data) {
        try {
            console.log('Creando un nuevo encargado con los datos:', data);
            if (!data.ci || !data.nombre || !data.apellido || !data.telefono || !data.password || !data.email) {
                throw new Error(
                    "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password, email"
                );
            }
            if (typeof data.ci !== 'number' ||typeof data.telefono !== 'string' ||typeof data.password !== 'string' || typeof data.nombre !== 'string' ||typeof data.apellido !== 'string' ||typeof data.email !== 'string') {
                throw new Error(
                    "ci y telefono deben ser números; nombre, apellido, email y password deben ser cadenas."
                );
            }
            const resultado = await EncargadoRepository.create(data);
            console.log('Encargado creado exitosamente:', resultado);
            return { status: 'success', message: 'Encargado creado correctamente', data: resultado };
        } catch (error) {
            console.error('Error al crear encargado:', error.message);
            throw new Error('No se pudo crear el encargado: ' + error.message);
        }
    }

    
    static async update(ci, data) {
        try {
            console.log(`Actualizando encargado con CI: ${ci}, datos:`, data);
            if (!ci || !data.nombre || !data.apellido || !data.telefono || !data.password || !data.email) {
                throw new Error(
                    "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password, email"
                );
            }
            if (typeof ci !== 'number' ||typeof data.telefono !== 'number' ||typeof data.password !== 'string' || typeof data.nombre !== 'string' ||typeof data.apellido !== 'string' ||typeof data.email !== 'string') {
                throw new Error(
                    "ci y telefono deben ser números; nombre, apellido, email y password deben ser cadenas."
                );
            }
            const resultado = await EncargadoRepository.update(ci, data);
            console.log(`Encargado con CI ${ci} actualizado exitosamente:`, resultado);
            return { status: 'success', message: 'Encargado actualizado correctamente', data: resultado };
        } catch (error) {
            console.error(`Error al actualizar encargado con CI ${ci}:`, error.message);
            throw new Error('No se pudo actualizar el encargado: ' + error.message);
        }
    }

    // Eliminar un encargado
    static async delete(ci) {
        try {
            console.log(`Eliminando encargado con CI: ${ci}...`);
            if (!ci) {
                throw new Error("El campo ci es obligatorio");
            }
            if (typeof ci !== 'number') {
                throw new Error("El campo ci debe ser un número");
            }
            const resultado = await EncargadoRepository.delete(ci);
            console.log(`Encargado con CI ${ci} eliminado exitosamente.`);
            return { status: 'success', message: 'Encargado eliminado correctamente', data: resultado };
        } catch (error) {
            console.error(`Error al eliminar encargado con CI ${ci}:`, error.message);
            throw new Error('No se pudo eliminar el encargado: ' + error.message);
        }
    }
}
