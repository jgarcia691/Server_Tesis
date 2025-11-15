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
} from "./controllers.js"; 

const router = express.Router();


const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 64 * 1024 * 1024 }, 
});

router.get("/tesis", getTesis); 
router.get("/tesis/cadena/:nombre", getTesisByName); 
router.get("/tesis/:id", getTesisById); 
router.get("/tesis/:id/autores", getTesisAutores); 
router.post("/tesis", upload.single("archivo_pdf"), uploadTesis); 
router.get("/tesis/:id/download", downloadTesis); 
router.delete("/tesis/:id", deleteTesis); 
router.put("/tesis/:id", upload.single("archivo_pdf"), updateTesis);

export default router;
