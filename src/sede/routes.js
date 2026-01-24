import express from "express";
import {
  getsedecontroller,
  postsedecontroller,
  deletesedecontroller,
  getsedebyidcontroller,
} from "./controllers.js";

const router = express.Router();

// Definición de rutas para Sedes
router.get("/search/:id", getsedebyidcontroller); // Buscar sede por ID
router.get("/", getsedecontroller); // Obtener todas las sedes
router.post("/", postsedecontroller); // Crear nueva sede
router.delete("/:id", deletesedecontroller); // Eliminar sede por ID

export default router;
