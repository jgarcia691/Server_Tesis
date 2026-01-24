import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { AlumnoCarreraRepository } from "./repositories.js";

export class AlumnoCarreraService {
  /**
   * Obtiene todos los registros de alumno_carrera.
   * @returns {Promise<Object>} Resultado con la lista de registros.
   */
  static async getAll() {
    try {
      console.log(
        "DEPURACIÓN: Obteniendo todos los registros de Alumno_carrera...",
      );
      const result = await AlumnoCarreraRepository.getAll();
      return { status: "success", data: result };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener registros:", error.message);
      throw new Error(
        "No se pudieron obtener los registros de Alumno_carrera.",
      );
    }
  }

  /**
   * Obtiene registros por código.
   * @param {number|string} codigo - Código a buscar.
   * @returns {Promise<Object>} Resultado con los datos encontrados.
   */
  static async getByCodigo(codigo) {
    try {
      console.log(`DEPURACIÓN: Buscando Alumno_carrera con código: ${codigo}`);
      const data = await AlumnoCarreraRepository.getByCodigo(codigo);

      if (!data || data.length === 0) {
        throw new Error("No se encontró el registro con ese código");
      }

      return { status: "success", data };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener por código:", error.message);
      throw new Error("No se pudo obtener el registro: " + error.message);
    }
  }

  /**
   * Crea un nuevo registro alumno_carrera.
   * @param {Object} data - Datos del registro.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log("DEPURACIÓN: Creando un nuevo registro con los datos:", data);
      if (!data.codigo || !data.id_estudiante || !data.id_carrera) {
        throw new Error(
          "Todos los campos son obligatorios: codigo, id_estudiante, id_carrera",
        );
      }

      const resultado = await AlumnoCarreraRepository.create(data);
      console.log("DEPURACIÓN: Registro creado exitosamente:", resultado);
      return {
        status: "success",
        message: "Registro creado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error al crear registro:", error.message);
      throw new Error("No se pudo crear el registro: " + error.message);
    }
  }

  /**
   * Elimina un registro por código.
   * @param {number|string} codigo - Código del registro.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(codigo) {
    try {
      console.log(`DEPURACIÓN: Eliminando registro con código: ${codigo}...`);
      if (!codigo) {
        throw new Error("El campo codigo es obligatorio");
      }

      const resultado = await AlumnoCarreraRepository.delete(codigo);
      console.log(
        `DEPURACIÓN: Registro con código ${codigo} eliminado exitosamente.`,
      );
      return {
        status: "success",
        message: "Registro eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error al eliminar registro con código ${codigo}:`,
        error.message,
      );
      throw new Error("No se pudo eliminar el registro: " + error.message);
    }
  }
}
