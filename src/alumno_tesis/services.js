import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// services.js

import { AlumnoTesisRepository } from "./repositories.js";

export class AlumnoTesisService {
  /**
   * Obtiene todos los registros de alumno_tesis.
   * @returns {Promise<Object>} Resultado con la lista.
   */
  static async getAll() {
    try {
      console.log(
        "DEPURACIÓN: Obteniendo todos los registros de Alumno_tesis...",
      );
      const data = await AlumnoTesisRepository.getAll();
      return { status: "success", data };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener registros:", error.message);
      throw new Error("No se pudieron obtener los registros de Alumno_tesis.");
    }
  }

  /**
   * Obtiene registro por ID.
   * @param {number} id - ID del registro.
   * @returns {Promise<Object>} Resultado con el registro.
   */
  static async getById(id) {
    try {
      console.log(`DEPURACIÓN: Buscando Alumno_tesis con id: ${id}`);
      const data = await AlumnoTesisRepository.getById(id);

      if (!data || data.length === 0) {
        throw new Error("No se encontró el registro con ese id");
      }

      return { status: "success", data };
    } catch (error) {
      console.error(
        "DEPURACIÓN: Error al obtener registro por id:",
        error.message,
      );
      throw new Error("No se pudo obtener el registro: " + error.message);
    }
  }

  /**
   * Crea una asociación alumno-tesis.
   * @param {Object} data - Datos de la asociación.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log(
        "DEPURACIÓN: Creando nuevo registro en Alumno_tesis con datos:",
        data,
      );

      if (!data.id_estudiante || !data.id_tesis) {
        throw new Error(
          "Todos los campos son obligatorios: id_estudiante, id_tesis",
        );
      }

      if (
        typeof data.id_estudiante !== "number" ||
        typeof data.id_tesis !== "number"
      ) {
        throw new Error("Todos los campos deben ser números.");
      }

      const result = await AlumnoTesisRepository.create(data);
      console.log("DEPURACIÓN: Registro creado exitosamente:", result);
      return {
        status: "success",
        message: "Registro creado correctamente",
        data: result,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error al crear registro:", error.message);
      throw new Error("No se pudo crear el registro: " + error.message);
    }
  }

  /**
   * Elimina una asociación alumno-tesis.
   * @param {number} id - ID del registro.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id) {
    try {
      console.log(`DEPURACIÓN: Eliminando registro con ID: ${id}...`);
      if (!id || typeof id !== "number") {
        throw new Error("El campo id es obligatorio y debe ser un número.");
      }

      const result = await AlumnoTesisRepository.delete(id);
      console.log("DEPURACIÓN: Registro eliminado exitosamente:", result);
      return {
        status: "success",
        message: "Registro eliminado correctamente",
        data: result,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error al eliminar registro:", error.message);
      throw new Error("No se pudo eliminar el registro: " + error.message);
    }
  }
}
