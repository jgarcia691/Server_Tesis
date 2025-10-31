import path from "path";
import { fileURLToPath } from "url";
import LoginService from "../auth/services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EstudianteRepository } from "./repositories.js";

export class EstudianteService {
  static async getAll() {
    try {
      const estudiantes = await EstudianteRepository.getAll();
      return { status: "success", data: estudiantes };
    } catch (error) {
      console.error("Error en EstudianteService.getAll:", error.message);
      throw new Error("No se pudieron obtener los estudiantes.");
    }
  }

  static async getByCi(ci) {
    try {
      const estudiante = await EstudianteRepository.getByCi(ci);
      if (!estudiante) {
        throw new Error(`El estudiante con CI ${ci} no existe.`);
      }
      return { status: "success", data: estudiante };
    } catch (error) {
      console.error(
        `Error en EstudianteService.getByCi (CI: ${ci}):`,
        error.message
      );
      throw new Error(error.message);
    }
  }

  static async create(data) {
    try {
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
      const resultado = await EstudianteRepository.create(data);
      await LoginService.register(data.ci, "estudiante", data.password);
      return {
        status: "success",
        message: "Estudiante creado correctamente",
        data: resultado,
      };
    } catch (error) {
      // Manejo específico para el error de email duplicado
      if (
        error.message.includes("UNIQUE constraint failed") &&
        error.message.includes("Persona.email")
      ) {
        throw new Error("El correo electrónico ya está registrado.");
      }
      console.error("Error en EstudianteService.create:", error.message);
      throw new Error("No se pudo crear el estudiante: " + error.message);
    }
  }

  static async update(ci, data) {
    try {
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
      const resultado = await EstudianteRepository.update(ci, data);
      return {
        status: "success",
        message: "Estudiante actualizado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `Error en EstudianteService.update (CI: ${ci}):`,
        error.message
      );
      throw new Error("No se pudo actualizar el estudiante: " + error.message);
    }
  }

  static async delete(ci) {
    try {
      const resultado = await EstudianteRepository.delete(ci);
      return {
        status: "success",
        message: "Estudiante eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `Error en EstudianteService.delete (CI: ${ci}):`,
        error.message
      );
      throw new Error("No se pudo eliminar el estudiante: " + error.message);
    }
  }
}
