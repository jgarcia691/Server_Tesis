import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { AlumnoCarreraService } from "./services.js";

export const getAlumnoCarreraController = async (req, res, next) => {
  try {
    const result = await AlumnoCarreraService.getAll();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAlumnoCarreraByCodigoController = async (req, res, next) => {
  try {
    const codigo = Number(req.params.codigo);

    if (!codigo || isNaN(codigo)) {
      return res
        .status(400)
        .json({ message: "El código debe ser un número válido." });
    }

    const result = await AlumnoCarreraService.getByCodigo(codigo);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const postAlumnoCarreraController = async (req, res, next) => {
  try {
    const { codigo, id_estudiante, id_carrera } = req.body;

    if (
      typeof codigo !== "number" ||typeof id_estudiante !== "number" ||typeof id_carrera !== "number"
    ) {
      return res.status(400).json({
        message: "codigo, id_estudiante e id_carrera deben ser números",
      });
    }

    const result = await AlumnoCarreraService.create({
      codigo,id_estudiante,id_carrera,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAlumnoCarreraController = async (req, res, next) => {
  try {
    const codigo = Number(req.params.codigo);
    if (isNaN(codigo)) {
      return res
        .status(400)
        .json({ message: "El código debe ser un número válido" });
    }

    const result = await AlumnoCarreraService.delete(codigo);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
