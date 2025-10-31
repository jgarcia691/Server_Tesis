import path from "path";
import { fileURLToPath } from "url";
import LoginService from "../auth/services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EncargadoRepository } from "./repositories.js";

export class EncargadoService {
  static async getAll() {
    try {
      console.log("Obteniendo todos los encargados...");
      const encargados = await EncargadoRepository.getAll();
      console.log("Encargados obtenidos:", encargados);
      return { status: "success", data: encargados };
    } catch (error) {
      console.error("Error al obtener encargados:", error.message);
      throw new Error("No se pudieron obtener los encargados.");
    }
  }

  static async getEncargado(ci) {
    try {
      console.log("Obteniendo encargado", ci);
      const encargado = await EncargadoRepository.getEncargado(ci);
      console.log("encargado obtenido: ", encargado);
      return { status: "success", data: encargado };
    } catch (error) {
      console.error("Error al obtener encargado: ", error.message);
      throw new Error("No se pudo obtener el encargado.");
    }
  }

  static async create(data) {
    try {
      console.log("Creando un nuevo encargado con los datos:", data);

      // Validaciones
      if (
        !data.ci ||
        !data.ci_type ||
        !data.nombre ||
        !data.apellido ||
        !data.telefono ||
        !data.email ||
        !data.password ||
        !data.id_sede
      ) {
        throw new Error(
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, telefono, email, password, id_sede"
        );
      }
      if (
        typeof data.ci !== "number" ||
        typeof data.ci_type !== "string" ||
        typeof data.telefono !== "string" ||
        typeof data.nombre !== "string" ||
        typeof data.apellido !== "string" ||
        typeof data.email !== "string" ||
        typeof data.password !== "string" ||
        typeof data.id_sede !== "number"
      ) {
        throw new Error(
          "ci y sede deben ser números; ci_type, nombre, apellido, email, telefono y password deben ser cadenas."
        );
      }

      const resultado = await EncargadoRepository.create(data);
      await LoginService.register(data.ci, "encargado", data.password);
      console.log("Encargado creado exitosamente:", resultado);
      return {
        status: "success",
        message: "Encargado creado correctamente",
        data: resultado,
      };
    } catch (error) {
      if (
        error.message.includes("UNIQUE constraint failed") &&
        error.message.includes("Persona.email")
      ) {
        throw new Error("El correo electrónico ya está registrado.");
      }
      console.error("Error al crear encargado:", error.message);
      throw new Error("No se pudo crear el encargado: " + error.message);
    }
  }

  static async update(ci, data) {
    try {
      console.log(`Actualizando encargado con CI: ${ci}, datos:`, data);

      // Validaciones
      if (
        !ci ||
        !data.nombre ||
        !data.apellido ||
        !data.telefono ||
        !data.email ||
        !data.id_sede
      ) {
        throw new Error( // Se eliminó 'password' de aquí
          "Todos los campos son obligatorios: ci, nombre, apellido, telefono, email, id_sede" // Se eliminó 'password' de aquí
        );
      }
      if (
        typeof ci !== "number" ||
        typeof data.nombre !== "string" ||
        typeof data.apellido !== "string" ||
        typeof data.email !== "string" ||
        typeof data.id_sede !== "number"
      ) {
        throw new Error(
          "ci y id_sede deben ser números; nombre, apellido, email y telefono deben ser cadenas." // Se eliminó 'password' de aquí
        );
      }

      const updatedData = { ...data };

      const resultado = await EncargadoRepository.update(ci, updatedData);
      console.log(
        `Encargado con CI ${ci} actualizado exitosamente:`,
        resultado
      );
      return {
        status: "success",
        message: "Encargado actualizado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `Error al actualizar encargado con CI ${ci}:`,
        error.message
      );
      throw new Error("No se pudo actualizar el encargado: " + error.message);
    }
  }

  static async delete(ci) {
    try {
      console.log(`Eliminando encargado con CI: ${ci}...`);

      if (!ci) throw new Error("El campo ci es obligatorio");
      if (typeof ci !== "number")
        throw new Error("El campo ci debe ser un número");

      const resultado = await EncargadoRepository.delete(ci);
      console.log(`Encargado con CI ${ci} eliminado exitosamente.`);
      return {
        status: "success",
        message: "Encargado eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(`Error al eliminar encargado con CI ${ci}:`, error.message);
      throw new Error("No se pudo eliminar el encargado: " + error.message);
    }
  }
}
