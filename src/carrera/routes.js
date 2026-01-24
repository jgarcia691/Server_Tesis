import express from "express";
import {
  getcarreracontroller,
  getcarreracodcontroller,
  postcarreracontroller,
  deletecarreracontroller,
} from "./controller.js";

const router = express.Router();

// Definición de rutas para Carreras
router.get("/", getcarreracontroller); // Obtener todas las carreras
router.get("/:cod", getcarreracodcontroller); // Obtener carrera por código
router.post("/", postcarreracontroller); // Crear nueva carrera
router.delete("/:cod", deletecarreracontroller); // Eliminar carrera

export default router;
