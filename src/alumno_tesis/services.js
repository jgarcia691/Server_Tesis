// services.js

import { AlumnoTesisRepository } from './repositories.js';

export class AlumnoTesisService {
  
  static async getAll() {
    try {
      console.log('Obteniendo todos los registros de Alumno_tesis...');
      const data = await AlumnoTesisRepository.getAll();
      console.log('Registros obtenidos:', data);
      return { status: 'success', data };
    } catch (error) {
      console.error('Error al obtener registros:', error.message);
      throw new Error('No se pudieron obtener los registros de Alumno_tesis.');
    }
  }

  static async getById(id) {
    try {
      console.log(`Buscando Alumno_tesis con id: ${id}`);
      const data = await AlumnoTesisRepository.getById(id);

      if (!data || data.length === 0) {
        throw new Error('No se encontró el registro con ese id');
      }

      return { status: 'success', data };
    } catch (error) {
      console.error('Error al obtener registro por id:', error.message);
      throw new Error('No se pudo obtener el registro: ' + error.message);
    }
  }


  static async create(data) {
    try {
      console.log('Creando nuevo registro en Alumno_tesis con datos:', data);

      if (!data.id_estudiante || !data.id_tesis) {
        throw new Error("Todos los campos son obligatorios: id_estudiante, id_tesis");
      }

      if (
        typeof data.id_estudiante !== 'number' ||
        typeof data.id_tesis !== 'number'
      ) {
        throw new Error("Todos los campos deben ser números.");
      }

      const result = await AlumnoTesisRepository.create(data);
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

      const result = await AlumnoTesisRepository.delete(id);
      console.log('Registro eliminado exitosamente:', result);
      return { status: 'success', message: 'Registro eliminado correctamente', data: result };
    } catch (error) {
      console.error('Error al eliminar registro:', error.message);
      throw new Error('No se pudo eliminar el registro: ' + error.message);
    }
  }
}
