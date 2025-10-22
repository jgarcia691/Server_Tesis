import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ProfesorService } from "./Services.js";

export const getallprofesorcontroller = async (req, res) => {
  try {
    const profesor = await ProfesorService.getAll();
    res.status(200).json(profesor);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Error al obtener profesor", error: error.message });
  }
};

export const getprofesorcontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    const profesor = await ProfesorService.getProfesor(ci);
    res.status(200).json(profesor);
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ message: "Error al obtener profesor", error: error.message });
  }
};

export const postprofesorcontroller = async (req, res) => {
  try {
    const { ci, ci_type, nombre, apellido, email, telefono, password } = req.body;
    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (
      typeof ci !== "number" ||
      typeof ci_type !== "string" ||
      typeof telefono !== "string" ||
      typeof email !== "string" ||
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof password !== "string"
    ) {
      return res
        .status(400) // Mensaje de error ajustado
        .json({
          message:
            "ci debe ser un número; ci_type, nombre, apellido, email, telefono y password deben ser cadenas.",
        }); // 'telefono' es TEXT en DB, debe ser string
    }
    await ProfesorService.create({ ci, ci_type, nombre, apellido, email, telefono, password });
    res.status(201).json({ message: "Profesor creado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Error al crear profesor", error: error.message });
  }
};

export const updateprofesorcontroller = async (req, res) => {
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

    await ProfesorService.update(ci, {
      ci_type,
      nombre,
      apellido,
      email,
      telefono: telefono, // Corregido el typo
    });
    res.status(200).json({ message: "Profesor actualizado correctamente" });
  } catch (error) {
    console.error("Error en updateProfesorController:", error.message);
    res.status(500).json({
      message: "Error al actualizar profesor",
      error: error.message,
    });
  }
};

export const deleteprofesorcontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    if (!ci) {
      return res.status(400).json({ message: "El campo ci es obligatorio" }); // La validación !ci es redundante si ci siempre viene de req.params
    }

    const ciNumber = Number(ci);
    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ message: "El campo ci debe ser un número válido" });
    }

    await ProfesorService.delete(ciNumber);
    res.status(200).json({ message: "profesor eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "profesor al eliminar usuario", error: error.message });
  }
};
