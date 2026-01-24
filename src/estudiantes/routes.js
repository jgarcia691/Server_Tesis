import express from "express";
import {
  getallEstudiantesControllers,
  createEstudianteControllers,
  updateEstudianteControllers,
  deleteEstudianteControllers,
  getidControllers,
} from "./controllers.js";

const router = express.Router();

// router.get('/username/:username', getallEstudiantesControllers);
router.get("/", getallEstudiantesControllers); // Obtener todos los estudiantes
router.get("/ci/:ci", getidControllers); // Obtener un estudiante por CI
router.post("/", createEstudianteControllers); // Crear un nuevo estudiante
router.put("/:ci", updateEstudianteControllers); // Actualizar un estudiante
router.delete("/:ci", deleteEstudianteControllers); // Eliminar un estudiante

export default router;
