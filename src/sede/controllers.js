import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SedeService } from "./services.js";

export const getsedecontroller = async (req, res, next) => {
  try {
    const sedes = await SedeService.getAll();
    res.status(200).json(sedes);
  } catch (error) {
    next(error);
  }
};

export const getsedebyidcontroller = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "El campo id es obligatorio para buscar una sede" });
    }

    const idNumber = Number(id);

    if (isNaN(idNumber)) {
      return res
        .status(400)
        .json({ message: "El campo id debe ser un número válido" });
    }

    const sede = await SedeService.getById(idNumber);
    res.status(200).json(sede);
  } catch (error) {
    next(error);
  }
};

export const postsedecontroller = async (req, res, next) => {
  try {
    const { id, nombre, Direccion, telefono } = req.body;

    if (!id || !nombre || !Direccion || !telefono) {
      return res
        .status(400)
        .json({
          message:
            "Todos los campos son obligatorios: id, nombre, Direccion, telefono",
        });
    }

    const idNumber = Number(id);
    if (
      isNaN(idNumber) ||
      typeof telefono !== "string" ||
      typeof nombre !== "string" ||
      typeof Direccion !== "string"
    ) {
      return res.status(400).json({
        message:
          "id y telefono deben ser números; nombre y Direccion deben ser cadenas.",
      });
    }

    await SedeService.create({ id: idNumber, nombre, Direccion, telefono });
    res.status(201).json({ message: "Sede creada correctamente" });
  } catch (error) {
    next(error);
  }
};

export const deletesedecontroller = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "El campo id es obligatorio para eliminar una sede" });
    }

    const idNumber = Number(id);

    if (isNaN(idNumber)) {
      return res
        .status(400)
        .json({ message: "El campo id debe ser un número válido" });
    }

    await SedeService.delete(idNumber);
    res.status(200).json({ message: "Sede eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
