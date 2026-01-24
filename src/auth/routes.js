import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { postlogincontroller, registerController } from "./controllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Definición de rutas de autenticación
router.post("/login", postlogincontroller); // Iniciar sesión
router.post("/register", registerController); // Registrar nuevo usuario (solo para configuración inicial o admin)

export default router;
