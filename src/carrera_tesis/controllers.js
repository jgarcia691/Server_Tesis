import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// controller.js

import { CarreraTesisService } from "./services.js";

/**
 * Obtiene todas las relaciones carrera-tesis.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const getCarreraTesisController = async (req, res, next) => {
  try {
    const result = await CarreraTesisService.getAll();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Crea una nueva relación carrera-tesis.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const postCarreraTesisController = async (req, res, next) => {
  try {
    const { id, id_carrera, id_tesis } = req.body;

    if (!id || !id_carrera || !id_tesis) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios: id, id_carrera, id_tesis",
      });
    }

    if (
      typeof id !== "number" ||
      typeof id_carrera !== "number" ||
      typeof id_tesis !== "number"
    ) {
      return res.status(400).json({
        message: "Todos los campos deben ser números.",
      });
    }

    const result = await CarreraTesisService.create({
      id,
      id_carrera,
      id_tesis,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una relación carrera-tesis por ID.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export const deleteCarreraTesisController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El campo id es obligatorio y debe ser un número válido.",
      });
    }

    const result = await CarreraTesisService.delete(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
