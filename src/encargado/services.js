import path from "path";
import { fileURLToPath } from "url";
import LoginService from "../auth/services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EncargadoRepository } from "./repositories.js";

export class EncargadoService {
  /**
   * Obtiene todos los encargados registrados.
   * @returns {Promise<Object>} Resultado con la lista de encargados.
   */
  static async getAll() {
    try {
      console.log("DEPURACIÓN: Obteniendo todos los encargados...");
      const encargados = await EncargadoRepository.getAll();
      console.log("DEPURACIÓN: Encargados obtenidos:", encargados);
      return { status: "success", data: encargados };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener encargados:", error.message);
      throw new Error("No se pudieron obtener los encargados.");
    }
  }

  /**
   * Obtiene un encargado por su CI.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object>} Resultado con el encargado encontrado.
   */
  static async getEncargado(ci) {
    try {
      console.log("DEPURACIÓN: Obteniendo encargado", ci);
      const encargado = await EncargadoRepository.getEncargado(ci);
      console.log("DEPURACIÓN: Encargado obtenido: ", encargado);
      return { status: "success", data: encargado };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener encargado: ", error.message);
      throw new Error("No se pudo obtener el encargado.");
    }
  }

  /**
   * Crea un nuevo encargado.
   * Valida datos, crea registro y usuario asociado.
   * @param {Object} data - Datos del encargado.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log(
        "DEPURACIÓN: Creando un nuevo encargado con los datos:",
        data,
      );

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
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, telefono, email, password, id_sede",
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
          "ci y sede deben ser números; ci_type, nombre, apellido, email, telefono y password deben ser cadenas.",
        );
      }

      const resultado = await EncargadoRepository.create(data);
      await LoginService.register(data.ci, "encargado", data.password);
      console.log("DEPURACIÓN: Encargado creado exitosamente:", resultado);
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
      console.error("DEPURACIÓN: Error al crear encargado:", error.message);
      throw new Error("No se pudo crear el encargado: " + error.message);
    }
  }

  /**
   * Actualiza el encargado identificado por CI.
   * @param {number} ci - Cédula de identidad.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  static async update(ci, data) {
    try {
      console.log(
        `DEPURACIÓN: Actualizando encargado con CI: ${ci}, datos:`,
        data,
      );

      // Validaciones
      if (
        !ci ||
        !data.nombre ||
        !data.apellido ||
        !data.telefono ||
        !data.email ||
        !data.id_sede
      ) {
        throw new Error(
          "Todos los campos son obligatorios: ci, nombre, apellido, telefono, email, id_sede",
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
          "ci y id_sede deben ser números; nombre, apellido, email y telefono deben ser cadenas.",
        );
      }

      const updatedData = { ...data };

      const resultado = await EncargadoRepository.update(ci, updatedData);
      console.log(
        `DEPURACIÓN: Encargado con CI ${ci} actualizado exitosamente:`,
        resultado,
      );
      return {
        status: "success",
        message: "Encargado actualizado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error al actualizar encargado con CI ${ci}:`,
        error.message,
      );
      throw new Error("No se pudo actualizar el encargado: " + error.message);
    }
  }

  /**
   * Elimina un encargado.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(ci) {
    try {
      console.log(`DEPURACIÓN: Eliminando encargado con CI: ${ci}...`);

      if (!ci) throw new Error("El campo ci es obligatorio");
      if (typeof ci !== "number")
        throw new Error("El campo ci debe ser un número");

      const resultado = await EncargadoRepository.delete(ci);
      console.log(`DEPURACIÓN: Encargado con CI ${ci} eliminado exitosamente.`);
      return {
        status: "success",
        message: "Encargado eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error al eliminar encargado con CI ${ci}:`,
        error.message,
      );
      throw new Error("No se pudo eliminar el encargado: " + error.message);
    }
  }
}
