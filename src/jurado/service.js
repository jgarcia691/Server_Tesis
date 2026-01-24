import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { JuradoRepository } from "./repositories.js";

export class JuradoService {
  /**
   * Obtiene el jurado asignado a una tesis.
   * @param {number} id_tesis - ID de la tesis.
   * @returns {Promise<Object>} Resultado con el jurado encontrado.
   */
  static async getJurado(id_tesis) {
    try {
      console.log("DEPURACIÓN: Obteniendo jurado... ");
      const jurado = await JuradoRepository.getJurado(id_tesis);
      console.log("DEPURACIÓN: Jurado obtenido", jurado);
      return { status: "success", data: jurado };
    } catch (error) {
      console.error(
        "DEPURACIÓN: Error al obtener el jurado de esta tesis",
        error.message,
      );
      throw new Error("No se pudo obtener el jurado");
    }
  }

  /**
   * Asigna un profesor como jurado de una tesis.
   * @param {Object} data - Datos de la asignación.
   * @returns {Promise<Object>} Resultado de la creación.
   */
  static async create(data) {
    try {
      console.log("DEPURACIÓN: Creando un nuevo jurado con los datos:", data);
      if (!data.id_tesis || !data.id_profesor) {
        throw new Error("Todos los campos son obligatorios");
      }
      if (
        typeof data.id_tesis !== "number" ||
        typeof data.id_profesor !== "number"
      ) {
        throw new Error("id_tesis e id_profesor deben ser números.");
      }
      const resultado = await JuradoRepository.create(data);
      console.log("DEPURACIÓN: Jurado creado exitosamente:", resultado);
      return {
        status: "success",
        message: "Jurado creado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error al crear el jurado:", error.message);
      throw new Error("No se pudo crear el jurado: " + error.message);
    }
  }

  /**
   * Elimina la asignación de un jurado.
   * @param {Object} data - Datos de la asignación a eliminar.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  static async delete(data) {
    try {
      console.log("DEPURACIÓN: Eliminando un jurado con los datos:", data);
      if (!data.id_tesis || !data.id_profesor) {
        throw new Error("Todos los campos son obligatorios");
      }
      if (
        typeof data.id_tesis !== "number" ||
        typeof data.id_profesor !== "number"
      ) {
        throw new Error("id_tesis e id_profesor deben ser números.");
      }
      console.log(
        "DEPURACIÓN: Sentencia SQL a ejecutar:",
        data.id_tesis,
        data.id_profesor,
      );
      const resultado = await JuradoRepository.delete(
        data.id_tesis,
        data.id_profesor,
      );
      console.log("DEPURACIÓN: Jurado eliminado exitosamente:", resultado);
      return {
        status: "success",
        message: "Jurado eliminado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error al eliminar el jurado:", error.message);
      throw new Error("No se pudo eliminar el jurado: " + error.message);
    }
  }
}
