import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SedeRepository } from "./repositories.js";

export class SedeService {
  /**
   * Obtiene todas las sedes.
   * @returns {Promise<Object>} Resultado con la lista de sedes.
   */
  static async getAll() {
    try {
      console.log("DEPURACIÓN: Obteniendo todas las sedes...");
      const sedes = await SedeRepository.getAll();
      console.log("DEPURACIÓN: Sedes obtenidas:", sedes);
      return { status: "success", data: sedes };
    } catch (error) {
      console.error("DEPURACIÓN: Error en SedeService.getAll:", error.message);
      throw new Error("No se pudieron obtener las sedes.");
    }
  }

  /**
   * Obtiene una sede por ID.
   * @param {number} id - ID de la sede.
   * @returns {Promise<Object>} Resultado con la sede.
   */
  static async getById(id) {
    try {
      if (!id || typeof id !== "number" || isNaN(id)) {
        throw new Error(
          "El campo id es obligatorio y debe ser un número válido.",
        );
      }

      console.log(`DEPURACIÓN: Obteniendo sede con ID: ${id}`);
      const sede = await SedeRepository.getById(id);
      if (!sede) {
        throw new Error(`La sede con ID ${id} no existe.`);
      }
      return { status: "success", data: sede };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error en SedeService.getById (ID: ${id}):`,
        error.message,
      );
      throw new Error("No se pudo obtener la sede: " + error.message);
    }
  }

  /**
   * Crea una nueva sede.
   * @param {Object} data - Datos de la sede.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      const { id, nombre, Direccion, telefono } = data;

      if (!id || !nombre || !Direccion || !telefono) {
        throw new Error(
          "Todos los campos son obligatorios: id, nombre, Direccion, telefono.",
        );
      }

      if (
        typeof id !== "number" ||
        isNaN(id) ||
        typeof telefono !== "string" ||
        typeof nombre !== "string" ||
        typeof Direccion !== "string"
      ) {
        throw new Error(
          "id y telefono deben ser números válidos; nombre y Direccion deben ser cadenas.",
        );
      }

      console.log("DEPURACIÓN: Creando una nueva sede con los datos:", data);
      // Normalizar clave "Direccion" (mayúscula) a "direccion" que espera el repositorio
      const resultado = await SedeRepository.create({
        id: id,
        nombre,
        direccion: Direccion,
        telefono,
      });
      console.log("DEPURACIÓN: Sede creada exitosamente:", resultado);
      return {
        status: "success",
        message: "Sede creada correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error en SedeService.create:", error.message);
      throw new Error("No se pudo crear la sede: " + error.message);
    }
  }

  /**
   * Elimina una sede.
   * @param {number} id - ID de la sede.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id) {
    try {
      if (!id || typeof id !== "number" || isNaN(id)) {
        throw new Error(
          "El campo id es obligatorio y debe ser un número válido.",
        );
      }

      console.log(`DEPURACIÓN: Eliminando sede con ID: ${id}...`);
      const resultado = await SedeRepository.delete(id);
      console.log(`DEPURACIÓN: Sede con ID ${id} eliminada exitosamente.`);
      return {
        status: "success",
        message: "Sede eliminada correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error en SedeService.delete (ID: ${id}):`,
        error.message,
      );
      throw new Error("No se pudo eliminar la sede: " + error.message);
    }
  }
}
