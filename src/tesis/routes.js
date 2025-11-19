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
  downloadAllTesis,
  getDownloadProgress,
  streamDownloadProgress,
  downloadResult,
  updateTesisStatus,
} from "./controllers.js"; // Asegúrate de que la ruta es correcta

const router = express.Router();

// Configuración de `multer` para la subida de archivos (en memoria para Vercel)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 64 * 1024 * 1024 }, // 64 MB
});

// Definición de rutas
// IMPORTANTE: Las rutas más específicas deben ir ANTES de las rutas con parámetros
router.get("/tesis", getTesis); // Obtener todas las tesis
router.get("/tesis/cadena/:nombre", getTesisByName); // Obtener una tesis que contenga x cadena en su nombre
router.get("/tesis/download/all", downloadAllTesis); // Iniciar descarga de todas las tesis (devuelve jobId)
router.get("/tesis/download/progress/:jobId/stream", streamDownloadProgress); // Stream de progreso (SSE)
router.get("/tesis/download/progress/:jobId", getDownloadProgress); // Obtener progreso (Polling)
router.get("/tesis/download/result/:jobId", downloadResult); // Descargar ZIP cuando esté listo
router.get("/tesis/:id/download", downloadTesis); // Descargar un PDF de una tesis
router.get("/tesis/:id/autores", getTesisAutores); // Obtener los autores de una tesis
router.get("/tesis/:id", getTesisById); // Obtener una tesis por ID (DEBE ir al final)
router.post("/tesis", upload.single("archivo_pdf"), uploadTesis); // Subir una nueva tesis con PDF
router.delete("/tesis/:id", deleteTesis); // Eliminar una tesis
router.put("/tesis/:id", upload.single("archivo_pdf"), updateTesis); // Actualizar una tesis
router.put("/tesis/:id/status", updateTesisStatus);

export default router;
