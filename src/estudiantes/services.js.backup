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
        error.message,
      );
      throw new Error(error.message);
    }
  }

  static async create(data) {
    try {
      const resultado = await EstudianteRepository.create(data);
      return {
        status: "success",
        message: "Estudiante creado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error("Error en EstudianteService.create:", error.message);
      throw new Error("No se pudo crear el estudiante: " + error.message);
    }
  }

  static async update(ci, data) {
    try {
      const resultado = await EstudianteRepository.update(ci, data);
      return {
        status: "success",
        message: "Estudiante actualizado correctamente",
        data: resultado,
      };
    } catch (error) {
      console.error(
        `Error en EstudianteService.update (CI: ${ci}):`,
        error.message,
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
        error.message,
      );
      throw new Error("No se pudo eliminar el estudiante: " + error.message);
    }
  }
}
