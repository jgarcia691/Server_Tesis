import { Router } from "express";
import {
  getallprofesorcontroller,
  getprofesorcontroller,
  postprofesorcontroller,
  deleteprofesorcontroller,
  updateprofesorcontroller,
} from "./controller.js";

const profesorRouter = Router();

// Definición de rutas para Profesores
profesorRouter.get("/", getallprofesorcontroller); // Obtener todos los profesores
profesorRouter.get("/:ci", getprofesorcontroller); // Obtener un profesor por CI
profesorRouter.post("/", postprofesorcontroller); // Crear un nuevo profesor
profesorRouter.put("/:ci", updateprofesorcontroller); // Actualizar un profesor
profesorRouter.delete("/:ci", deleteprofesorcontroller); // Eliminar un profesor

export default profesorRouter;
