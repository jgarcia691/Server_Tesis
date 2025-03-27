import { UsuarioRepository } from '../repositories/usuario.repository.js';

export class UsuarioService {
  static async getAll() {
    return await UsuarioRepository.getAll();
  }

  static async create(data) {
    return await UsuarioRepository.create(data);
  }

  static async update(ci, data) {
    return await UsuarioRepository.update(ci, data);
  }

  static async delete(ci) {
    return await UsuarioRepository.delete(ci);
  }
}
