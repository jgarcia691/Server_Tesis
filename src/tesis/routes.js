import express from "express";
import multer from "multer";  // Asegúrate de que multer se importe correctamente
import db from "../../db.js";  // Asegúrate de que esta importación sea correcta

const router = express.Router();

// Configuración de Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();  // Almacena el archivo en memoria
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Limita el tamaño del archivo a 10MB
});

// Ruta para obtener todas las tesis
router.get("/", (req, res) => {
  const sql = "SELECT id, nombre, fecha, estado FROM Tesis";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error en el servidor", error: err });
    return res.json(result);  // Retorna solo los campos principales de la tesis (sin el archivo)
  });
});

// Ruta para obtener el archivo PDF de una tesis
router.get("/download/:id", (req, res) => {
  const sql = "SELECT archivo_pdf FROM Tesis WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error en el servidor", error: err });

    if (!result.length) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    // Configurar la respuesta para la descarga del archivo PDF
    res.setHeader("Content-Disposition", "attachment; filename=tesis.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(result[0].archivo_pdf);  // Enviar el archivo PDF como respuesta
  });
});

// Ruta para insertar nueva tesis
router.post("/", upload.single("archivo_pdf"), (req, res) => {
  // Verificar que el archivo se ha recibido correctamente
  const { nombre, fecha, estado } = req.body;
  const archivo_pdf = req.file ? req.file.buffer : null;

  if (!archivo_pdf) {
    return res.status(400).json({ message: "El archivo PDF es obligatorio" });
  }

  const sql = `
    INSERT INTO Tesis (nombre, fecha, estado, archivo_pdf)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [nombre, fecha, estado, archivo_pdf], (err, result) => {
    if (err) {
      console.error("Error al insertar la tesis:", err);
      return res.status(500).json({ message: "Error al insertar la tesis", error: err });
    }
    return res.json({ message: "Tesis añadida correctamente", result });
  });
});

// Ruta para actualizar una tesis
router.put("/:id", upload.single("archivo_pdf"), (req, res) => {
  const { id_encargado, id_sede, id_tutor, nombre, fecha, estado } = req.body;
  const archivo_pdf = req.file ? req.file.buffer : null;

  let sql = "UPDATE Tesis SET id_encargado=?, id_sede=?, id_tutor=?, nombre=?, fecha=?, estado=?";
  let params = [id_encargado, id_sede, id_tutor, nombre, fecha, estado];

  if (archivo_pdf) {
    sql += ", archivo_pdf=?";
    params.push(archivo_pdf);
  }

  sql += " WHERE id=?";
  params.push(req.params.id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Error al actualizar la tesis", error: err });
    return res.json({ message: "Tesis actualizada correctamente", result });
  });
});

export default router;

