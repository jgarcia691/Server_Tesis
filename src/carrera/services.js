import { CarreraRepository } from "./repositories.js";

export class CarreraService {

  static async getAll() {
    try {
      console.log('Obteniendo todas las carreras...');
      const carrera = await CarreraRepository.getAll();
      console.log('Carreras obtenidas:', carrera);
      return { status: 'success', data: carrera };
    } catch (error) {
      console.error('Error al obtener Carreras:', error.message);
      throw new Error('No se pudieron obtener los carreras.');
    }
  }

  static async getCarrera(codigo){
    try{
        console.log('Obteniendo carrera');
        const carrera = await CarreraRepository.getCarrera(codigo);
        console.log('Carrera obtenida: ', carrera);
        return {status: 'success', data: carrera};
    } catch (error) {
        console.error('Error al obtener carrera: ',error.message);
        throw new Error('No se pudo obtener la carrera.');
    }
  }

  static async create(data) {
    try {
      console.log('Creando una nueva carrera con los datos:', data);
      if (!data.codigo || !data.nombre || !data.campo) {
        throw new Error("Todos los campos son obligatorios: codigo, nombre, campo");
      }
      if (
        typeof data.codigo !== 'number' || 
        typeof data.nombre !== 'string' || 
        typeof data.campo !== 'string'
      ) {
        throw new Error("codigo debe ser numero, campo y nombre cadenas.");
      }
      const resultado = await CarreraRepository.create(data);
      console.log('carrera creado exitosamente:', resultado);
      return { status: 'success', message: 'carrera creado correctamente', data: resultado };
    } catch (error) {
      console.error('Error al crear carrera:', error.message);
      throw new Error('No se pudo crear el carrera: ' + error.message);
    }
  }

  static async delete(codigo) {
    try {
      console.log(`Eliminando carrera con codigo: ${codigo}...`);
      if (!ci) {
        throw new Error("El campo codigo es obligatorio");
      }
      if (typeof codigo !== 'number') {
        throw new Error("El campo ci debe ser un número");
      }
      const resultado = await CarreraRepository.delete(codigo);
      console.log(`Carrera con Codigo ${codigo} eliminado exitosamente.`);
      return { status: 'success', message: 'Carrera eliminado correctamente', data: resultado };
    } catch (error) {
      console.error(`Error al eliminar carrera con Codigo ${codigo}:`, error.message);
      throw new Error('No se pudo eliminar la carrera: ' + error.message);
    }
  }



}