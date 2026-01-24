import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { JuradoService } from "./service.js";

/**
 * Obtiene la lista de jurados asignados a una tesis específica.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getjuradocontroller = async (req, res, next) => {
  try {
    const { id_tesis } = req.params;
    const jurado = await JuradoService.getJurado(id_tesis);
    res.status(200).json(jurado);
  } catch (error) {
    next(error);
  }
};

/**
 * Asigna un profesor como jurado de una tesis.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const postjuradocontroller = async (req, res, next) => {
  try {
    const { id_tesis, id_profesor } = req.body;
    if (!id_tesis || !id_profesor) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (typeof id_tesis !== "number" || typeof id_profesor !== "number") {
      return res.status(400).json({ message: "Ambas ID deben ser números" });
    }
    await JuradoService.create({ id_tesis, id_profesor });
    res.status(201).json({ message: "Jurado asignado correctamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina la asignación de un jurado (relación tesis-profesor).
 * Se espera recibir los IDs en el cuerpo de la petición.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const deletejuradocontroller = async (req, res, next) => {
  try {
    const { id_tesis, id_profesor } = req.body;
    if (!id_tesis || !id_profesor) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (typeof id_tesis !== "number" || typeof id_profesor !== "number") {
      return res.status(400).json({ message: "Ambas ID deben ser números" });
    }
    await JuradoService.delete({ id_tesis, id_profesor });
    res.status(201).json({ message: "Jurado eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
