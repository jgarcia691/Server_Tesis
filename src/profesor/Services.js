import path from "path";
import { fileURLToPath } from "url";
import LoginService from "../auth/services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ProfesorRepository } from "./repositories.js";

export class ProfesorService {
  static async getAll() {
    try {
      console.log("Obteniendo todos los profesores...");
      const profesor = await ProfesorRepository.getAll();
      console.log("Profesores obtenidos:", profesor);
      return { status: "success", data: profesor };
    } catch (error) {
      console.error("Error al obtener profesores:", error.message);
      throw new Error("No se pudieron obtener los profesores.");
    }
  }

  static async getProfesor(ci) {
    try {
      console.log("Obteniendo profesor", ci);
      const profesor = await ProfesorRepository.getProfesor(ci);
      
      // 💡 MODIFICACIÓN: Lanzar error si no se encuentra
      if (!profesor) {
        throw new Error(`El profesor con CI ${ci} no existe.`);
      }
      
      console.log("profesor obtenida: ", profesor);
      return { status: "success", data: profesor };
    } catch (error) {
      console.error("Error al obtener profesor: ", error.message);
      // Relanzar el error (sea "no existe" u otro)
      throw new Error(error.message);
    }
  }

  static async create(data) {
    try {
      console.log("Creando un nuevo profesor con los datos:", data);
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
      console.log("profesor creado exitosamente:", resultado);
      return {
        status: "success",
        message: "profesor creado correctamente",
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
      
      console.error("Error al crear el profesor:", error.message);
      // 💡 SOLUCIÓN: Relanzar el error original
      throw error;
    }
  }

  static async update(ci, data) {
    try {
      console.log(`Actualizando profesor con cedula: ${ci}...`);
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
        throw new Error("codigo debe ser numero, campo y nombre cadenas.");
      }
      const resultado = await ProfesorRepository.update(ci, data);
      console.log(`profesor con ci ${ci} actualizado exitosamente.`);
      return {
        status: "success",
        message: "profesor actualizado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `Error al actualizar profesor con Codigo ${ci}:`,
        error.message
      );
      throw new Error("No se pudo actualizar el profesor: " + error.message);
    }
  }

  static async delete(ci) {
    try {
      console.log(`Eliminando profesor con cedula: ${ci}...`);
      if (!ci) {
        throw new Error("El campo ci es obligatorio");
      }
      if (typeof ci !== "number") {
        throw new Error("El campo ci debe ser un número");
      }
      const resultado = await ProfesorRepository.delete(ci);
      console.log(`profesor con ci ${ci} eliminado exitosamente.`);
      return {
        status: "success",
        message: "profesor eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `Error al eliminar profesor con Codigo ${ci}:`,
        error.message
      );
      throw new Error("No se pudo eliminar el profesor: " + error.message);
    }
  }
}