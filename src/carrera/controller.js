import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { CarreraService } from "./services.js";

export const getcarreracontroller = async (req, res, next) => {
  try {
    const carreras = await CarreraService.getAll();
    res.status(200).json(carreras);
  } catch (error) {
    next(error);
  }
};

export const getcarreracodcontroller = async (req, res, next) => {
  try {
    const { cod } = req.params;
    const carreras = await CarreraService.getCarrera(cod);
    res.status(200).json(carreras);
  } catch (error) {
    next(error);
  }
};

export const postcarreracontroller = async (req, res, next) => {
  try {
    const { codigo, nombre, campo } = req.body;
    if (!codigo || !nombre || !campo) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (
      typeof codigo !== "number" ||typeof nombre !== "string" ||typeof campo !== "string"
    ) {
      return res.status(400).json({
        message: "codigo debe ser números, nombre y campo deben ser cadenas",
      });
    }
    const result = await CarreraService.create({ codigo, nombre, campo });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deletecarreracontroller = async (req, res, next) => {
  try {
    const { codigo } = req.params;
    if (!codigo) {
      return res
        .status(400)
        .json({ message: "El campo codigo es obligatorio" });
    }

    const codNumber = Number(codigo);
    if (isNaN(codNumber)) {
      return res
        .status(400)
        .json({ message: "El campo cODIGO debe ser un número válido" });
    }

    await CarreraService.delete(codNumber);
    res.status(200).json({ message: "Carrera eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
