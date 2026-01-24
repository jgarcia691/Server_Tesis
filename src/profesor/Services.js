import path from "path";
import { fileURLToPath } from "url";
import LoginService from "../auth/services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ProfesorRepository } from "./repositories.js";

export class ProfesorService {
  /**
   * Obtiene todos los profesores registrados.
   * @returns {Promise<Object>} Resultado con la lista de profesores.
   */
  static async getAll() {
    try {
      console.log("DEPURACIÓN: Obteniendo todos los profesores...");
      const profesor = await ProfesorRepository.getAll();
      console.log("DEPURACIÓN: Profesores obtenidos:", profesor);
      return { status: "success", data: profesor };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener profesores:", error.message);
      throw new Error("No se pudieron obtener los profesores.");
    }
  }

  /**
   * Obtiene un profesor por su CI.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object>} Resultado con el profesor encontrado.
   */
  static async getProfesor(ci) {
    try {
      console.log("DEPURACIÓN: Obteniendo profesor", ci);
      const profesor = await ProfesorRepository.getProfesor(ci);

      // 💡 MODIFICACIÓN: Lanzar error si no se encuentra
      if (!profesor) {
        throw new Error(`El profesor con CI ${ci} no existe.`);
      }

      console.log("DEPURACIÓN: Profesor obtenido: ", profesor);
      return { status: "success", data: profesor };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener profesor: ", error.message);
      // Relanzar el error (sea "no existe" u otro)
      throw new Error(error.message);
    }
  }

  /**
   * Crea un nuevo profesor.
   * Valida datos, crea registro y usuario asociado.
   * @param {Object} data - Datos del profesor.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log("DEPURACIÓN: Creando un nuevo profesor con los datos:", data);
      if (
        !data.ci ||
        !data.ci_type ||
        !data.nombre ||
        !data.apellido ||
        !data.email ||
        !data.telefono ||
        !data.password
      ) {
        throw new Error("Todos los campos son obligatorios");
      }
      if (
        typeof data.ci !== "number" ||
        typeof data.ci_type !== "string" ||
        typeof data.nombre !== "string" ||
        typeof data.apellido !== "string" ||
        typeof data.email !== "string" ||
        typeof data.telefono !== "string" ||
        typeof data.password !== "string"
      ) {
        throw new Error("Tipos de datos inválidos");
      }
      const resultado = await ProfesorRepository.create(data);
      await LoginService.register(data.ci, "profesor", data.password);
      console.log("DEPURACIÓN: Profesor creado exitosamente:", resultado);
      return {
        status: "success",
        message: "Profesor creado correctamente",
        data: resultado,
      };
    } catch (error) {
      if (
        error.message && // Añadida comprobación
        error.message.includes("UNIQUE constraint failed") &&
        error.message.includes("Persona.email")
      ) {
        throw new Error("El correo electrónico ya está registrado.");
      }

      console.error("DEPURACIÓN: Error al crear el profesor:", error.message);
      // 💡 SOLUCIÓN: Relanzar el error original
      throw error;
    }
  }

  /**
   * Actualiza el profesor identificado por CI.
   * @param {number} ci - Cédula de identidad.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  static async update(ci, data) {
    try {
      console.log(`DEPURACIÓN: Actualizando profesor con cédula: ${ci}...`);
      if (
        !data.ci_type ||
        !data.nombre ||
        !data.apellido ||
        !data.email ||
        !data.telefono
      ) {
        throw new Error("Todos los campos son obligatorios");
      }
      if (
        typeof data.ci_type !== "string" ||
        typeof data.nombre !== "string" ||
        typeof data.apellido !== "string" ||
        typeof data.email !== "string" ||
        typeof data.telefono !== "string"
      ) {
        throw new Error("Tipos de datos inválidos (cadenas esperadas).");
      }
      const resultado = await ProfesorRepository.update(ci, data);
      console.log(
        `DEPURACIÓN: Profesor con CI ${ci} actualizado exitosamente.`,
      );
      return {
        status: "success",
        message: "Profesor actualizado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error al actualizar profesor con CI ${ci}:`,
        error.message,
      );
      throw new Error("No se pudo actualizar el profesor: " + error.message);
    }
  }

  /**
   * Elimina un profesor.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(ci) {
    try {
      console.log(`DEPURACIÓN: Eliminando profesor con cédula: ${ci}...`);
      if (!ci) {
        throw new Error("El campo ci es obligatorio");
      }
      if (typeof ci !== "number") {
        throw new Error("El campo ci debe ser un número");
      }
      const resultado = await ProfesorRepository.delete(ci);
      console.log(`DEPURACIÓN: Profesor con CI ${ci} eliminado exitosamente.`);
      return {
        status: "success",
        message: "Profesor eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error al eliminar profesor con CI ${ci}:`,
        error.message,
      );
      throw new Error("No se pudo eliminar el profesor: " + error.message);
    }
  }
}
