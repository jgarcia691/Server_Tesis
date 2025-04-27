// services.js

import { CarreraTesisRepository } from './repositories.js';

export class CarreraTesisService {
  
  static async getAll() {
    try {
      console.log('Obteniendo todos los registros de Carrera_tesis...');
      const data = await CarreraTesisRepository.getAll();
      console.log('Registros obtenidos:', data);
      return { status: 'success', data };
    } catch (error) {
      console.error('Error al obtener registros:', error.message);
      throw new Error('No se pudieron obtener los registros de Carrera_tesis.');
    }
  }

  static async create(data) {
    try {
      console.log('Creando nuevo registro en Carrera_tesis con datos:', data);

      if (!data.id || !data.id_carrera || !data.id_tesis) {
        throw new Error("Todos los campos son obligatorios: id, id_carrera, id_tesis");
      }

      if (
        typeof data.id !== 'number' ||
        typeof data.id_carrera !== 'number' ||
        typeof data.id_tesis !== 'number'
      ) {
        throw new Error("Todos los campos deben ser números.");
      }

      const result = await CarreraTesisRepository.create(data);
      console.log('Registro creado exitosamente:', result);
      return { status: 'success', message: 'Registro creado correctamente', data: result };
    } catch (error) {
      console.error('Error al crear registro:', error.message);
      throw new Error('No se pudo crear el registro: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      console.log(`Eliminando registro con ID: ${id}...`);
      if (!id || typeof id !== 'number') {
        throw new Error("El campo id es obligatorio y debe ser un número.");
      }

      const result = await CarreraTesisRepository.delete(id);
      console.log('Registro eliminado exitosamente:', result);
      return { status: 'success', message: 'Registro eliminado correctamente', data: result };
    } catch (error) {
      console.error('Error al eliminar registro:', error.message);
      throw new Error('No se pudo eliminar el registro: ' + error.message);
    }
  }
}
