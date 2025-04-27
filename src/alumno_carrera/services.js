import { AlumnoCarreraRepository } from './repositories.js';

export class AlumnoCarreraService {

  static async getAll() {
    try {
      console.log('Obteniendo todos los registros de Alumno_carrera...');
      const result = await AlumnoCarreraRepository.getAll();
      console.log('Registros obtenidos:', result);
      return { status: 'success', data: result };
    } catch (error) {
      console.error('Error al obtener registros:', error.message);
      throw new Error('No se pudieron obtener los registros de Alumno_carrera.');
    }
  }

  static async getByCodigo(codigo) {
    try {
      console.log(`Buscando Alumno_carrera con código: ${codigo}`);
      const data = await AlumnoCarreraRepository.getByCodigo(codigo);
  
      if (!data || data.length === 0) {
        throw new Error('No se encontró el registro con ese código');
      }
  
      return { status: 'success', data };
    } catch (error) {
      console.error('Error al obtener por código:', error.message);
      throw new Error('No se pudo obtener el registro: ' + error.message);
    }
  }

  static async create(data) {
    try {
      console.log('Creando un nuevo registro con los datos:', data);
      if (!data.codigo || !data.id_estudiante || !data.id_carrera) {
        throw new Error("Todos los campos son obligatorios: codigo, id_estudiante, id_carrera");
      }

      const resultado = await AlumnoCarreraRepository.create(data);
      console.log('Registro creado exitosamente:', resultado);
      return { status: 'success', message: 'Registro creado correctamente', data: resultado };
    } catch (error) {
      console.error('Error al crear registro:', error.message);
      throw new Error('No se pudo crear el registro: ' + error.message);
    }
  }

  static async delete(codigo) {
    try {
      console.log(`Eliminando registro con código: ${codigo}...`);
      if (!codigo) {
        throw new Error("El campo codigo es obligatorio");
      }

      const resultado = await AlumnoCarreraRepository.delete(codigo);
      console.log(`Registro con código ${codigo} eliminado exitosamente.`);
      return { status: 'success', message: 'Registro eliminado correctamente', data: resultado };
    } catch (error) {
      console.error(`Error al eliminar registro con código ${codigo}:`, error.message);
      throw new Error('No se pudo eliminar el registro: ' + error.message);
    }
  }
}
