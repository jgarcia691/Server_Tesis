import express from "express";
import {
  getallencargadocontroller,
  getencargadocontroller,
  postencargadocontroller,
  putencargadocontroller,
  deletencargadocontroller,
} from "./controllers.js";

const router = express.Router();

router.get("/", getallencargadocontroller); // Obtener todos los encargados
router.get("/:ci", getencargadocontroller); // Obtener un encargado por CI
router.post("/", postencargadocontroller); // Crear un nuevo encargado
router.put("/:ci", putencargadocontroller); // Actualizar un encargado existente
router.delete("/:ci", deletencargadocontroller); // Eliminar un encargado

export default router;
