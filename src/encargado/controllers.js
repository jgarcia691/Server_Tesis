import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EncargadoService } from "./services.js";

/**
 * Obtiene todos los encargados registrados.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getallencargadocontroller = async (req, res, next) => {
  try {
    const encargados = await EncargadoService.getAll();
    res.status(200).json(encargados);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un encargado específico por su Cédula de Identidad (CI).
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getencargadocontroller = async (req, res, next) => {
  try {
    const { ci } = req.params;
    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return next(new Error("El CI debe ser un número válido."));
    }

    const encargado = await EncargadoService.getEncargado(ciNumber);
    res.status(200).json(encargado);
  } catch (error) {
    next(error);
  }
};

/**
 * Crea un nuevo encargado.
 * Requiere datos personales y credenciales.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const postencargadocontroller = async (req, res, next) => {
  try {
    const {
      ci,
      ci_type,
      nombre,
      apellido,
      telefono,
      email,
      password,
      id_sede,
    } = req.body;

    if (
      !ci ||
      !ci_type ||
      !nombre ||
      !apellido ||
      !telefono ||
      !email ||
      !password ||
      !id_sede
    ) {
      return next(new Error("Todos los campos son obligatorios"));
    }

    if (typeof ci !== "number" || typeof id_sede !== "number") {
      return next(
        new Error(
          "Tipos de datos inválidos. Asegúrese de que ci e id_sede sean números.",
        ),
      );
    }
    await EncargadoService.create({
      ci,
      ci_type,
      nombre,
      apellido,
      telefono,
      email,
      password,
      id_sede,
    });
    res.status(201).json({ message: "Encargado creado correctamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza la información de un encargado existente.
 * Nota: La contraseña no se actualiza a través de este endpoint.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const putencargadocontroller = async (req, res, next) => {
  try {
    const ci = Number(req.params.ci);
    const { nombre, apellido, telefono, email, id_sede } = req.body; // No se espera 'password' aquí

    if (!ci || !nombre || !apellido || !email || !telefono || !id_sede) {
      return next(
        new Error(
          "Todos los campos son obligatorios: nombre, apellido, telefono, email, id_sede",
        ),
      );
    }

    if (isNaN(ci) || typeof id_sede !== "number") {
      return next(new Error("El CI y el id_sede deben ser números válidos."));
    }

    // ⚠️ La actualización de contraseña debe ser un endpoint separado (si se implementa).
    await EncargadoService.update(ci, {
      nombre,
      apellido,
      telefono,
      email,
      id_sede,
    });

    res.status(200).json({ message: "Encargado actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un encargado por su CI.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const deletencargadocontroller = async (req, res, next) => {
  try {
    const { ci } = req.params;

    // La validación !ci es redundante si ci siempre viene de req.params
    if (isNaN(Number(ci))) {
      // Validar que ci sea un número antes de intentar convertirlo
      return next(new Error("El campo ci debe ser un número válido"));
    }

    const ciNumber = Number(ci);
    if (isNaN(ciNumber)) {
      return next(new Error("El campo ci debe ser un número válido"));
    }

    await EncargadoService.delete(ciNumber);
    res.status(200).json({ message: "Encargado eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
