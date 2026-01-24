import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { CarreraRepository } from "./repositories.js";

export class CarreraService {
  /**
   * Obtiene todas las carreras registradas.
   * @returns {Promise<Object>} Resultado con la lista de carreras.
   */
  static async getAll() {
    try {
      console.log("DEPURACIÓN: Obteniendo todas las carreras...");
      const carrera = await CarreraRepository.getAll();
      return { status: "success", data: carrera };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener Carreras:", error.message);
      throw new Error("No se pudieron obtener las carreras.");
    }
  }

  /**
   * Obtiene una carrera por su código.
   * @param {number} codigo - Código de la carrera.
   * @returns {Promise<Object>} Resultado con la carrera encontrada.
   */
  static async getCarrera(codigo) {
    try {
      console.log("DEPURACIÓN: Obteniendo carrera");
      const carrera = await CarreraRepository.getCarrera(codigo);
      console.log("DEPURACIÓN: Carrera obtenida: ", carrera);
      return { status: "success", data: carrera };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener carrera: ", error.message);
      throw new Error("No se pudo obtener la carrera.");
    }
  }

  /**
   * Crea una nueva carrera.
   * @param {Object} data - Datos de la carrera.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log("DEPURACIÓN: Creando una nueva carrera con los datos:", data);
      if (!data.codigo || !data.nombre || !data.campo) {
        throw new Error(
          "Todos los campos son obligatorios: codigo, nombre, campo",
        );
      }
      if (
        typeof data.codigo !== "number" ||
        typeof data.nombre !== "string" ||
        typeof data.campo !== "string"
      ) {
        throw new Error("codigo debe ser número, campo y nombre cadenas.");
      }

      const existingCarreraResult = await CarreraService.getCarrera(
        data.codigo,
      );
      if (existingCarreraResult.data) {
        throw new Error("Ya existe una carrera con el código proporcionado.");
      }
      const resultado = await CarreraRepository.create(data);
      console.log("DEPURACIÓN: Carrera creada exitosamente:", resultado);
      return {
        status: "success",
        message: "Carrera creada correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error al crear carrera:", error.message);
      throw new Error("No se pudo crear la carrera: " + error.message);
    }
  }

  /**
   * Elimina una carrera por su código.
   * @param {number} codigo - Código de la carrera.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(codigo) {
    try {
      console.log(`DEPURACIÓN: Eliminando carrera con codigo: ${codigo}...`);
      if (!codigo) {
        throw new Error("El campo codigo es obligatorio");
      }
      if (typeof codigo !== "number") {
        throw new Error("El campo codigo debe ser un número");
      }
      const resultado = await CarreraRepository.delete(codigo);
      console.log(
        `DEPURACIÓN: Carrera con Código ${codigo} eliminada exitosamente.`,
      );
      return {
        status: "success",
        message: "Carrera eliminada correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `DEPURACIÓN: Error al eliminar carrera con Código ${codigo}:`,
        error.message,
      );
      throw new Error("No se pudo eliminar la carrera: " + error.message);
    }
  }
}
