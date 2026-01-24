import express from "express";
import {
  getjuradocontroller,
  postjuradocontroller,
  deletejuradocontroller,
} from "./controller.js";

const router = express.Router();

// Definición de rutas para Jurados
router.get("/:id_tesis", getjuradocontroller); // Obtener jurados de una tesis
router.post("/", postjuradocontroller); // Asignar un profesor como jurado a una tesis
router.delete("/", deletejuradocontroller); // Eliminar la asignación de un jurado

export default router;
