import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { JuradoService } from "./service.js";

export const getjuradocontroller = async (req, res, next) => {
  try {
    const { id_tesis } = req.params;
    const jurado = await JuradoService.getJurado(id_tesis);
    res.status(200).json(jurado);
  } catch (error) {
    next(error);
  }
};

export const postjuradocontroller = async (req, res, next) => {
  try {
    const { id_tesis, id_profesor } = req.body;
    if (!id_tesis || !id_profesor) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (typeof id_tesis !== "number" || typeof id_profesor !== "number") {
      return res.status(400).json({ message: "ambas id deben ser números" });
    }
    await JuradoService.create({ id_tesis, id_profesor });
    res.status(201).json({ message: "jurado creado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const deletejuradocontroller = async (req, res, next) => {
  try {
    const { id_tesis, id_profesor } = req.body;
    if (!id_tesis || !id_profesor) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    if (typeof id_tesis !== "number" || typeof id_profesor !== "number") {
      return res.status(400).json({ message: "ambas id deben ser números" });
    }
    await JuradoService.delete({ id_tesis, id_profesor });
    res.status(201).json({ message: "jurado eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
