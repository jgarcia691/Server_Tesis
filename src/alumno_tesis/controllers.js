import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { AlumnoTesisService } from "./services.js";

/**
 * Obtiene todas las relaciones alumno-tesis.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const getAlumnoTesisController = async (req, res, next) => {
  try {
    const result = await AlumnoTesisService.getAll();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene una relación alumno-tesis por su ID.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const getAlumnoTesisByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ message: "El id debe ser un número válido." });
    }

    const result = await AlumnoTesisService.getById(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Crea una nueva relación alumno-tesis.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const postAlumnoTesisController = async (req, res, next) => {
  try {
    const { id_estudiante, id_tesis } = req.body;

    if (!id_estudiante || !id_tesis) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios: id_estudiante, id_tesis",
      });
    }

    if (typeof id_estudiante !== "number" || typeof id_tesis !== "number") {
      return res.status(400).json({
        message: "Todos los campos deben ser números.",
      });
    }

    const result = await AlumnoTesisService.create({ id_estudiante, id_tesis });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una relación alumno-tesis por ID.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const deleteAlumnoTesisController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El campo id es obligatorio y debe ser un número válido.",
      });
    }

    const result = await AlumnoTesisService.delete(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
