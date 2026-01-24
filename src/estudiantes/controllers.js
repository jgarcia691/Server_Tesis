import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EstudianteService } from "./services.js";

/**
 * Obtiene todos los estudiantes registrados.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getallEstudiantesControllers = async (req, res, next) => {
  try {
    const estudiantes = await EstudianteService.getAll();
    res.status(200).json(estudiantes);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un estudiante específico por su CI.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const getidControllers = async (req, res, next) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res.status(400).json({ error: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ error: "El campo ci debe ser un número válido" });
    }

    const estudiante = await EstudianteService.getByCi(ciNumber);

    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.status(200).json(estudiante);
  } catch (error) {
    // Si el servicio lanza un error (como "no existe"), lo capturamos aquí
    const errorMsg = typeof error === "string" ? error : error.message || "";
    if (errorMsg.includes("no existe")) {
      return res.status(404).json({ error: errorMsg });
    }
    next(error);
  }
};

/**
 * Crea un nuevo estudiante.
 * Verifica duplicados antes de crear.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const createEstudianteControllers = async (req, res, next) => {
  try {
    const { ci, ci_type, nombre, apellido, email, telefono, password } =
      req.body;

    if (!ci || !ci_type || !nombre || !apellido) {
      return res.status(400).json({
        error:
          "Los siguientes campos son obligatorios: ci, ci_type, nombre, apellido",
      });
    }

    if (
      typeof ci !== "number" ||
      typeof ci_type !== "string" ||
      typeof telefono !== "string" ||
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error:
          "ci debe ser número; ci_type, telefono, nombre, apellido, email y password deben ser cadenas.",
      });
    }

    // --- INICIO DE LA VALIDACIÓN DE DUPLICADOS ---

    let existingEstudiante = null;
    try {
      // 1. Intentamos buscar al estudiante
      existingEstudiante = await EstudianteService.getByCi(ci);
    } catch (findError) {
      // 2. Capturamos el error "no existe" de forma robusta
      const errorMsg =
        typeof findError === "string" ? findError : findError.message || "";

      if (errorMsg.includes("no existe")) {
        existingEstudiante = null; // Confirmado: no existe, podemos crear.
      } else {
        // Si es un error diferente (ej. DB desconectada), lo lanzamos
        throw findError;
      }
    }

    // 3. Si la búsqueda SÍ encontró un estudiante
    if (existingEstudiante) {
      // 409 Conflict: El recurso ya existe.
      return res.status(409).json({
        error: "Ya existe un estudiante registrado con esta cédula.",
      });
    }

    // 4. Intentar crear la Persona y el Estudiante
    await EstudianteService.create({
      ci,
      ci_type,
      nombre,
      apellido,
      email,
      telefono,
      password,
    });

    // 201 Created
    res.status(201).json({ message: "Estudiante creado correctamente" });
  } catch (error) {
    // 5. Capturar el error de restricción ÚNICA de Persona
    const errorMsg = typeof error === "string" ? error : error.message || "";
    const errorCode = error.code || "";

    if (
      (errorCode === "SQLITE_CONSTRAINT" ||
        errorMsg.includes("SQLITE_CONSTRAINT")) &&
      errorMsg.includes("Persona.ci")
    ) {
      // 409 Conflict: La Persona ya existe (ej. es un Profesor)
      return res.status(409).json({
        error:
          "Esta cédula ya está registrada en el sistema (posiblemente como Profesor o Encargado). No se puede crear como nuevo estudiante.",
        code: "DUPLICATE_PERSONA_CI",
      });
    }

    // 6. Si es otro tipo de error, pasarlo al manejador de errores (Error 500)
    next(error);
  }
};

/**
 * Actualiza la información de un estudiante existente.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const updateEstudianteControllers = async (req, res, next) => {
  try {
    const ci = Number(req.params.ci);
    const { ci_type, nombre, apellido, email, telefono } = req.body;

    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono) {
      return res.status(400).json({
        error:
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, email, telefono",
      });
    }

    if (
      isNaN(ci) ||
      typeof ci_type !== "string" ||
      typeof telefono !== "string" ||
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        error:
          "ci debe ser un número válido; ci_type, nombre, apellido, email y telefono deben ser cadenas.",
      });
    }

    await EstudianteService.update(ci, {
      ci_type,
      nombre,
      apellido,
      email,
      telefono: telefono,
    });
    res.status(200).json({ message: "Estudiante actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un estudiante por su CI.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware para manejo de errores.
 */
export const deleteEstudianteControllers = async (req, res, next) => {
  try {
    const { ci } = req.params;

    if (isNaN(Number(ci))) {
      return res
        .status(400)
        .json({ error: "El campo ci debe ser un número válido" });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ error: "El campo ci debe ser un número válido" });
    }

    await EstudianteService.delete(ciNumber);
    res.status(200).json({ message: "Estudiante eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
