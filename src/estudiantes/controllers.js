import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EstudianteService } from "./services.js";

export const getallEstudiantesControllers = async (req, res, next) => {
  try {
    const estudiantes = await EstudianteService.getAll();
    res.status(200).json(estudiantes);
  } catch (error) {
    next(error);
  }
};

export const getidControllers = async (req, res, next) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return next(new Error("El campo ci es obligatorio"));
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return next(new Error("El campo ci debe ser un número válido"));
    }

    const estudiante = await EstudianteService.getByCi(ciNumber);
    res.status(200).json(estudiante);
  } catch (error) {
    next(error);
  }
};

export const createEstudianteControllers = async (req, res, next) => {
  try {
    const { ci, ci_type, nombre, apellido, email, telefono, password } =
      req.body;

    if (
      !ci ||
      !ci_type ||
      !nombre ||
      !apellido
    ) {
      return next(
        new Error(
          "Los siguientes campos son obligatorios: ci, ci_type, nombre, apellido"
        )
      );
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
      return next(
        new Error(
          "ci  debe ser número; ci_type, telefono, nombre, apellido, email y password deben ser cadenas."
        )
      );
    }

    await EstudianteService.create({
      ci,
      ci_type,
      nombre,
      apellido,
      email,
      telefono,
      password,
    });
    res.status(201).json({ message: "Estudiante creado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const updateEstudianteControllers = async (req, res, next) => {
  try {
    const ci = Number(req.params.ci);
    const { ci_type, nombre, apellido, email, telefono } = req.body;

    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono) {
      return next(
        new Error(
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, email, telefono"
        )
      );
    }

    if (
      isNaN(ci) ||
      typeof ci_type !== "string" ||
      typeof telefono !== "string" || // 'telefono' es TEXT en DB, debe ser string
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof email !== "string"
    ) {
      return next(
        new Error(
          "ci debe ser un número válido; ci_type, nombre, apellido, email y telefono deben ser cadenas."
        )
      );
    }

    await EstudianteService.update(ci, {
      ci_type,
      nombre,
      apellido,
      email,
      telefono: telefono, // Corregido el typo
    });
    res.status(200).json({ message: "Estudiante actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const deleteEstudianteControllers = async (req, res, next) => {
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

    await EstudianteService.delete(ciNumber);
    res.status(200).json({ message: "Estudiante eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
