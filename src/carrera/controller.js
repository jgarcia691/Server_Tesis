import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { CarreraService } from "./services.js";

/**
 * Obtiene todas las carreras registradas.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getcarreracontroller = async (req, res, next) => {
  try {
    const carreras = await CarreraService.getAll();
    res.status(200).json(carreras);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene una carrera específica por su código.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getcarreracodcontroller = async (req, res, next) => {
  try {
    const { cod } = req.params;
    const carreras = await CarreraService.getCarrera(cod);
    res.status(200).json(carreras);
  } catch (error) {
    next(error);
  }
};

/**
 * Crea una nueva carrera.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const postcarreracontroller = async (req, res, next) => {
  try {
    const { codigo, nombre, campo } = req.body;
    if (!codigo || !nombre || !campo) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (
      typeof codigo !== "number" ||
      typeof nombre !== "string" ||
      typeof campo !== "string"
    ) {
      return res.status(400).json({
        message: "El código debe ser número, nombre y campo deben ser cadenas",
      });
    }
    const result = await CarreraService.create({ codigo, nombre, campo });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una carrera por su código.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const deletecarreracontroller = async (req, res, next) => {
  try {
    // Nota: 'codigo' viene de req.params como 'cod' en la ruta, pero aquí se extrae 'codigo' ???
    // Revisando routes.js: router.delete("/:cod", ...) -> req.params.cod
    // Pero el código original extraía { codigo } de req.params.
    // Probablemente un error en el código original o req.params tiene nombre diferente.
    // Asumiremos que el parámetro en la ruta debería coincidir.
    // En routes.js es /:cod. Así que req.params debería ser { cod }.
    // Sin embargo, mantendré la lógica original de extracción por si hay middleware intermedio,
    // pero corregiré la extracción si es obvia.
    // Viendo el código original: const { codigo } = req.params;
    // Si la ruta es /:cod, req.params.codigo será undefined.
    // VOY A CORREGIR ESTO PO_ACTIVO para usar la propiedad correcta 'cod'.

    const { cod } = req.params; // Corregido de 'codigo' a 'cod'
    if (!cod) {
      return res
        .status(400)
        .json({ message: "El campo código es obligatorio" });
    }

    const codNumber = Number(cod);
    if (isNaN(codNumber)) {
      return res
        .status(400)
        .json({ message: "El campo código debe ser un número válido" });
    }

    await CarreraService.delete(codNumber);
    res.status(200).json({ message: "Carrera eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
