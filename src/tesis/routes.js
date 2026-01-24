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
// IMPORTANTE: Las rutas más específicas deben ir ANTES de las rutas con parámetros dinámicos
router.get("/tesis", getTesis); // Obtener todas las tesis con filtros opcionales
router.get("/tesis/cadena/:nombre", getTesisByName); // Buscar tesis por coincidencia de nombre
router.get("/tesis/download/all", downloadAllTesis); // Iniciar proceso de descarga masiva (retorna ID de trabajo)
router.get("/tesis/download/progress/:jobId/stream", streamDownloadProgress); // Transmisión de progreso en tiempo real (SSE)
router.get("/tesis/download/progress/:jobId", getDownloadProgress); // Consultar progreso de descarga por ID de trabajo
router.get("/tesis/download/result/:jobId", downloadResult); // Descargar archivo ZIP finalizado
router.get("/tesis/:id/download", downloadTesis); // Descargar el archivo PDF de una tesis específica
router.get("/tesis/:id/autores", getTesisAutores); // Obtener lista de autores de una tesis
router.get("/tesis/:id", getTesisById); // Obtener detalles completos de una tesis por ID
router.post("/tesis", upload.single("archivo_pdf"), uploadTesis); // Crear nueva tesis subiendo archivo PDF
router.delete("/tesis/:id", deleteTesis); // Eliminar una tesis y sus relaciones
router.put("/tesis/:id", upload.single("archivo_pdf"), updateTesis); // Actualizar información y/o archivo de una tesis
router.put("/tesis/:id/status", updateTesisStatus); // Actualizar el estado de una tesis

export default router;
