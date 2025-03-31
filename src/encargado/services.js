import { UsuarioRepository } from './repositories.js';

export class UsuarioService {
  
  static async getAll() {
    try {
      console.log('Obteniendo todos los usuarios...');
      const usuarios = await UsuarioRepository.getAll();
      console.log('Usuarios obtenidos:', usuarios);
      return { status: 'success', data: usuarios };
    } catch (error) {
      console.error('Error al obtener usuarios:', error.message);
      throw new Error('No se pudieron obtener los usuarios.');
    }
  }

 
  static async create(data) {
    try {
      console.log('Creando un nuevo usuario con los datos:', data);
      if (!data.ci || !data.nombre || !data.apellido || !data.telefono || !data.password) {
        throw new Error("Todos los campos son obligatorios: ci, nombre, apellido, telefono, password");
      }
      if (
        typeof data.ci !== 'number' || 
        typeof data.telefono !== 'number' || 
        typeof data.password !== 'number' || 
        typeof data.nombre !== 'string' || 
        typeof data.apellido !== 'string'
      ) {
        throw new Error("ci, telefono y password deben ser números; nombre y apellido deben ser cadenas.");
      }
      const resultado = await UsuarioRepository.create(data);
      console.log('Usuario creado exitosamente:', resultado);
      return { status: 'success', message: 'Usuario creado correctamente', data: resultado };
    } catch (error) {
      console.error('Error al crear usuario:', error.message);
      throw new Error('No se pudo crear el usuario: ' + error.message);
    }
  }

  
  static async update(ci, data) {
    try {
      console.log(`Actualizando usuario con CI: ${ci}, datos:`, data);
      if (!ci || !data.nombre || !data.apellido || !data.telefono || !data.password) {
        throw new Error("Todos los campos son obligatorios: ci, nombre, apellido, telefono, password");
      }
      if (
        typeof ci !== 'number' || 
        typeof data.telefono !== 'number' || 
        typeof data.password !== 'number' || 
        typeof data.nombre !== 'string' || 
        typeof data.apellido !== 'string'
      ) {
        throw new Error("ci, telefono y password deben ser números; nombre y apellido deben ser cadenas.");
      }
      const resultado = await UsuarioRepository.update(ci, data);
      console.log(`Usuario con CI ${ci} actualizado exitosamente:`, resultado);
      return { status: 'success', message: 'Usuario actualizado correctamente', data: resultado };
    } catch (error) {
      console.error(`Error al actualizar usuario con CI ${ci}:`, error.message);
      throw new Error('No se pudo actualizar el usuario: ' + error.message);
    }
  }

  
  static async delete(ci) {
    try {
      console.log(`Eliminando usuario con CI: ${ci}...`);
      if (!ci) {
        throw new Error("El campo ci es obligatorio");
      }
      if (typeof ci !== 'number') {
        throw new Error("El campo ci debe ser un número");
      }
      const resultado = await UsuarioRepository.delete(ci);
      console.log(`Usuario con CI ${ci} eliminado exitosamente.`);
      return { status: 'success', message: 'Usuario eliminado correctamente', data: resultado };
    } catch (error) {
      console.error(`Error al eliminar usuario con CI ${ci}:`, error.message);
      throw new Error('No se pudo eliminar el usuario: ' + error.message);
    }
  }
}