import express from "express";
import multer from "multer";
import {
  getTesis,
  getTesisById,
  uploadTesis,
  downloadTesis,
  deleteTesis,
  updateTesis,
  getTesisByName,
  getTesisAutores,
} from "./controllers.js"; // Asegúrate de que la ruta es correcta

const router = express.Router();

// Configuración de `multer` para la subida de archivos (en memoria para Vercel)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 64 * 1024 * 1024 }, // 64 MB
});

// Definición de rutas
router.get("/tesis", getTesis); // Obtener todas las tesis
router.get("/tesis/cadena/:nombre", getTesisByName); // Obtener una tesis que contenga x cadena en su nombre
router.get("/tesis/:id", getTesisById); // Obtener una tesis por ID
router.get("/tesis/:id/autores", getTesisAutores); // Obtener los autores de una tesis
router.post("/tesis", upload.single("archivo_pdf"), uploadTesis); // Subir una nueva tesis con PDF
router.get("/tesis/:id/download", downloadTesis); // Descargar un PDF de una tesis
router.delete("/tesis/:id", deleteTesis); // Eliminar una tesis
// Ruta que maneja la carga del archivo
router.put("/tesis/:id", upload.single("archivo_pdf"), updateTesis);

export default router;
