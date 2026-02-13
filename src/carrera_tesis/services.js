import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// services.js

import { CarreraTesisRepository } from "./repositories.js";

export class CarreraTesisService {
  /**
   * Obtiene todos los registros de carrera_tesis.
   * @returns {Promise<Object>} Resultado con la lista.
   */
  static async getAll() {
    try {
      console.log(
        "DEPURACIÓN: Obteniendo todos los registros de Carrera_tesis...",
      );
      const data = await CarreraTesisRepository.getAll();
      return { status: "success", data };
    } catch (error) {
      console.error("DEPURACIÓN: Error al obtener registros:", error.message);
      throw new Error("No se pudieron obtener los registros de Carrera_tesis.");
    }
  }

  /**
   * Crea una asociación carrera-tesis.
   * @param {Object} data - Datos de la asociación.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log(
        "DEPURACIÓN: Creando nuevo registro en Carrera_tesis con datos:",
        data,
      );

      if (!data.id || !data.id_carrera || !data.id_tesis) {
        throw new Error(
          "Todos los campos son obligatorios: id, id_carrera, id_tesis",
        );
      }

      if (
        typeof data.id !== "number" ||
        typeof data.id_carrera !== "number"
      ) {
        throw new Error("id e id_carrera deben ser números.");
      }

      const result = await CarreraTesisRepository.create(data);
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
   * Elimina una asociación carrera-tesis.
   * @param {number} id - ID del registro.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(id) {
    try {
      console.log(`DEPURACIÓN: Eliminando registro con ID: ${id}...`);
      if (!id || typeof id !== "number") {
        throw new Error("El campo id es obligatorio y debe ser un número.");
      }

      const result = await CarreraTesisRepository.delete(id);
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
