import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

import fs from "fs";

import { postAlumnoTesisController } from "../alumno_tesis/controllers.js";
import { uploadBufferToTerabox } from "../../config/terabox.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTesis = async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT nombre, id_encargado, id_tutor, id_sede, fecha, estado FROM Tesis",
    });

    console.log("Resultado obtenido:", result);

    // Ahora debes enviar el resultado por res.json()
    res.json(result.rows); // <- así responde correctamente al navegador
  } catch (err) {
    console.error("Error en getTesis:", err.message);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

// Obtener una tesis por ID (con PDF)
export const getTesisById = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido:", id);
  const sql =
    "SELECT nombre, id_encargado, id_tutor, id_sede, fecha, estado FROM Tesis WHERE id = ?";
  console.log("Consulta SQL:", sql);

  try {
    const result = await db.execute(sql, [id]);
    console.log("Resultado obtenido:", result);

    // Ahora debes enviar el resultado por res.json()
    res.json(result.rows); // <- así responde correctamente al navegador
  } catch (err) {
    console.error("Error en getTesisById:", err.message);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

// Obtener una tesis por nombre (con PDF)
export const getTesisByName = async (req, res) => {
  console.log(req.params);
  const { nombre } = req.params;
  const sql =
    "SELECT nombre, id_encargado, id_tutor, id_sede, fecha, estado FROM Tesis WHERE nombre LIKE ?";
  const searchTerm = `%${nombre}%`; // Añade los comodines %

  console.log(`Buscando término:`, searchTerm);

  try {
    const result = await db.execute(sql, [searchTerm]); // Usando db.execute
    const rows = result.rows || result; // si db.execute devuelve { rows: [...] } o simplemente [...]

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    res.json(rows); // Devuelve todo el array de resultados
  } catch (err) {
    console.error("Error al obtener tesis por nombre:", err.message);
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

// Subir una nueva tesis
export const uploadTesis = async (req, res) => {
  console.log("Archivo recibido:", req.file);
  console.log("Cuerpo recibido:", req.body);

  const {
    id_tesis,
    nombre,
    id_estudiante,
    id_tutor,
    id_encargado,
    fecha,
    id_sede,
    estado,
  } = req.body;

  const idTesisInt = parseInt(id_tesis, 10);
  const idEstudianteInt = parseInt(id_estudiante, 10);

  // Validaciones básicas
  if (isNaN(idTesisInt)) {
    return res
      .status(400)
      .json({ message: "El ID de la tesis debe ser un número entero válido." });
  }
  if (isNaN(idEstudianteInt)) {
    return res
      .status(400)
      .json({
        message: "El ID del estudiante debe ser un número entero válido.",
      });
  }
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: "El archivo PDF es obligatorio" });
  }

  // Leer el archivo PDF desde memoria
  const archivo_pdf = Buffer.from(req.file.buffer);

  // Verificar si ya existe una tesis con ese id_tesis
  const checkSql = "SELECT id FROM Tesis WHERE id = ?";
  const checkResult = await db.execute(checkSql, [idTesisInt]);

  if (checkResult.rows.length > 0) {
    return res.status(400).json({ message: "Ya existe una tesis con ese ID." });
  }

  // Subir a Terabox y obtener detalles
  let archivoUrl = null;
  let teraboxFsId = null;
  try {
    const details = await uploadBufferToTerabox(archivo_pdf, req.file.originalname, "/tesis");
    console.log("Detalles de la tesis:", details);
    // La librería documenta fileDetails; asumimos que incluye 'fs_id' y posiblemente 'dlink'
    teraboxFsId = details?.fs_id || null;
    archivoUrl = details?.dlink || details?.link || null; // fallback si expone link directo
  } catch (e) {
    console.error("Error subiendo a Terabox:", e.message);
    return res.status(500).json({ message: "Error subiendo a almacenamiento", error: e.message });
  }

  // Insertar la tesis (guardando URL en vez de BLOB)
  const sqlTesis = `
        INSERT INTO Tesis (id, id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_url, terabox_fs_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  try {
    await db.execute(sqlTesis, [
      idTesisInt,
      id_encargado,
      id_sede,
      id_tutor,
      nombre,
      fecha,
      estado,
      archivoUrl,
      teraboxFsId,
    ]);

    console.log("Tesis añadida con ID:", idTesisInt);

    // Asociar estudiante con tesis en alumno_tesis
    const fakeReq = {
      body: {
        id_estudiante: idEstudianteInt,
        id_tesis: idTesisInt,
      },
    };
    const fakeRes = {
      json: (response) => console.log("Respuesta de alumno_tesis:", response),
      status: (statusCode) => ({
        json: (response) => console.log(`Error ${statusCode}:`, response),
      }),
    };

    await postAlumnoTesisController(fakeReq, fakeRes);

    // Responder éxito
    return res.json({
      message: "Tesis subida correctamente y autor asociado",
      id_tesis: idTesisInt,
      archivo_url: archivoUrl,
      terabox_fs_id: teraboxFsId,
    });
  } catch (error) {
    console.error("Error al subir la tesis o asociar el autor:", error);

    return res
      .status(500)
      .json({ message: "Error al subir la tesis o asociar el autor", error });
  }
};

export const downloadTesis = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido:", id);

  // Primero intenta con URL
  try {
    const result = await db.execute("SELECT archivo_url, archivo_pdf FROM Tesis WHERE id = ?", [id]);
    const row = result?.rows?.[0];
    if (!row) return res.status(404).json({ message: "Tesis no encontrada" });

    if (row.archivo_url) {
      // Redirigir a URL (pública o presignada)
      return res.redirect(row.archivo_url);
    }

    // Fallback: si existe BLOB (para datos antiguos)
    if (row.archivo_pdf) {
      const archivoPdfBuffer = Buffer.from(row.archivo_pdf);
      if (archivoPdfBuffer.length === 0) {
        return res.status(404).json({ message: "Archivo PDF no encontrado" });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=tesis_${id}.pdf`);
      return res.end(archivoPdfBuffer);
    }

    return res.status(404).json({ message: "Archivo no disponible" });
  } catch (err) {
    console.error("Error al descargar el archivo:", err.message);
    return res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

// Eliminar una tesis
export const deleteTesis = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Tesis WHERE id = ?";

  try {
    const result = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    return res.json({ message: "Tesis eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la tesis:", err.message);
    return res
      .status(500)
      .json({ message: "Error al eliminar la tesis", error: err.message });
  }
};

// Actualizar una tesis
export const updateTesis = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha, estado } = req.body;

  // Verifica si el archivo está presente
  const archivoPdf = req.file && req.file.buffer ? Buffer.from(req.file.buffer) : null;

  // Construye la consulta SQL
  let query = `UPDATE Tesis SET nombre = ?, fecha = ?, estado = ?`;
  let params = [nombre, fecha, estado];

  if (archivoPdf) {
    query += `, archivo_pdf = ?`;
    params.push(archivoPdf);
  }

  query += ` WHERE id = ?`;
  params.push(id);

  try {
    console.log("Consulta SQL:", query); // Verifica la consulta generada
    console.log("Parámetros:", params); // Verifica los parámetros pasados

    // Ejecuta la consulta
    const result = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tesis no encontrada." });
    }

    return res
      .status(200)
      .json({ message: "Tesis actualizada correctamente." });
  } catch (err) {
    console.error("Error al actualizar la tesis:", err.message);
    return res
      .status(500)
      .json({
        message: "Hubo un error al actualizar la tesis.",
        error: err.message,
      });
  }
};
