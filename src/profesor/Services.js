import { ProfesorRepository } from "./repositories.js";

export class ProfesorService {

  static async getAll() {
    try {
      console.log('Obteniendo todas las carreras...');
      const profesor = await ProfesorRepository.getAll();
      console.log('Carreras obtenidas:', profesor);
      return { status: 'success', data: profesor };
    } catch (error) {
      console.error('Error al obtener Carreras:', error.message);
      throw new Error('No se pudieron obtener los carreras.');
    }
  }

  static async getProfesor(ci){
    try{
        console.log('Obteniendo profesor', ci);
        const profesor = await ProfesorRepository.getProfesor(ci);
        console.log('profesor obtenida: ', profesor);
        return {status: 'success', data: profesor};
    } catch (error) {
        console.error('Error al obtener profesor: ',error.message);
        throw new Error('No se pudo obtener el profesor.');
    }
  }

  static async create(data) {
    try {
      console.log('Creando un nuevo profesor con los datos:', data);
      if (!data.ci || !data.nombre || !data.apellido || !data.email || !data.telefono) {
        throw new Error("Todos los campos son obligatorios");
      }
      if (
        typeof data.ci !== 'number' || 
        typeof data.nombre !== 'string' || 
        typeof data.apellido !== 'string' ||
        typeof data.email !== 'string' ||
        typeof data.telefono !== 'string'
      ) {
        throw new Error("codigo debe ser numero, campo y nombre cadenas.");
      }
      const resultado = await ProfesorRepository.create(data);
      console.log('profesor creado exitosamente:', resultado);
      return { status: 'success', message: 'profesor creado correctamente', data: resultado };
    } catch (error) {
      console.error('Error al crear el profesor:', error.message);
      throw new Error('No se pudo crear el profesor: ' + error.message);
    }
  }

  static async delete(ci) {
    try {
      console.log(`Eliminando profesor con cedula: ${ci}...`);
      if (!ci) {
        throw new Error("El campo ci es obligatorio");
      }
      if (typeof ci !== 'number') {
        throw new Error("El campo ci debe ser un número");
      }
      const resultado = await ProfesorRepository.delete(ci);
      console.log(`profesor con ci ${ci} eliminado exitosamente.`);
      return { status: 'success', message: 'profesor eliminado correctamente', data: resultado };
    } catch (error) {
      console.error(`Error al eliminar profesor con Codigo ${ci}:`, error.message);
      throw new Error('No se pudo eliminar el profesor: ' + error.message);
    }
  }

}