import express from "express";
import multer from "multer";
import {
    getTesis,
    getTesisById,
    uploadTesis,
    downloadTesis,
    deleteTesis,
    updateTesis,
    getTesisByName
} from "./controllers.js"; // Asegúrate de que la ruta es correcta

const router = express.Router();

// Configuración de `multer` para la subida de archivos
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 64 * 1024 * 1024 }, // 10 MB de tamaño máximo
});

// Definición de rutas
router.get("/tesis", getTesis); // Obtener todas las tesis
router.get("/tesis/cadena/:nombre", getTesisByName); // Obtener una tesis que contenga x cadena en su nombre
router.get("/tesis/:id", getTesisById); // Obtener una tesis por ID
router.post("/tesis", upload.single("archivo_pdf"), uploadTesis); // Subir una nueva tesis con PDF
router.get("/tesis/:id/download", downloadTesis); // Descargar un PDF de una tesis
router.delete("/tesis/:id", deleteTesis); // Eliminar una tesis
// Ruta que maneja la carga del archivo
router.put('/tesis/:id', upload.single('archivo_pdf'), updateTesis);

export default router;
