import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EstudianteService } from "./services.js";

export const getallEstudiantesControllers = async (req, res) => {
  try {
    const estudiantes = await EstudianteService.getAll();
    res.status(200).json(estudiantes);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener estudiantes", error: error.message });
  }
};

export const getidControllers = async (req, res) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res.status(400).json({ message: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ message: "El campo ci debe ser un número válido" });
    }

    const estudiante = await EstudianteService.getByCi(ciNumber);
    res.status(200).json(estudiante);
  } catch (error) {
    console.error("Error en getidController:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener estudiante", error: error.message });
  }
};

export const createEstudianteControllers = async (req, res) => {
  try {
    const { ci, ci_type, nombre, apellido, email, telefono, password } = req.body;

    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono || !password) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, email, telefono, password",
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
        message:
          "ci  debe ser número; ci_type, telefono, nombre, apellido, email y password deben ser cadenas.",
      });
    }

    await EstudianteService.create({ ci, ci_type, nombre, apellido, email, telefono, password });
    res.status(201).json({ message: "Estudiante creado correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al crear estudiante", error: error.message });
  }
};

export const updateEstudianteControllers = async (req, res) => {
  try {
    const ci = Number(req.params.ci);
    const { ci_type, nombre, apellido, email, telefono } = req.body;

    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, email, telefono",
      });
    }

    if (
      isNaN(ci) ||
      typeof ci_type !== "string" ||
      typeof telefono !== "string" || // 'telefono' es TEXT en DB, debe ser string
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        // Mensaje de error ajustado
        message:
          "ci debe ser un número válido; ci_type, nombre, apellido, email y telefono deben ser cadenas.",
      });
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
    console.error("Error en updateEstudianteController:", error.message);
    res.status(500).json({
      message: "Error al actualizar estudiante",
      error: error.message,
    });
  }
};

export const deleteEstudianteControllers = async (req, res) => {
  try {
    const { ci } = req.params;

    // La validación !ci es redundante si ci siempre viene de req.params
    if (isNaN(Number(ci))) {
      // Validar que ci sea un número antes de intentar convertirlo
      return res.status(400).json({ message: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ message: "El campo ci debe ser un número válido" });
    }

    await EstudianteService.delete(ciNumber);
    res.status(200).json({ message: "Estudiante eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al eliminar estudiante", error: error.message });
  }
};
