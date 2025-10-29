import https from "https";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

import fs from "fs";

import { postAlumnoTesisController } from "../alumno_tesis/controllers.js";
import {
  uploadBufferToTerabox,
  getDownloadLinkFromFsId,
} from "../../config/terabox.js";
import { EstudianteService } from "../estudiantes/services.js";
import { EncargadoService } from "../encargado/services.js";
import { ProfesorService } from "../profesor/Services.js";
import { EstudianteRepository } from "../estudiantes/repositories.js";
import { ProfesorRepository } from "../profesor/repositories.js";
import { EncargadoRepository } from "../encargado/repositories.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTesis = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          t.id, t.nombre, t.id_encargado, t.id_tutor, t.id_sede, t.fecha, t.estado,
          JSON_GROUP_ARRAY(
            JSON_OBJECT(
              'ci', p.ci,
              'nombre', p.nombre,
              'apellido', p.apellido,
              'email', p.email
            )
          ) FILTER (WHERE p.ci IS NOT NULL) as autores
        FROM Tesis t
        LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
        LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
        LEFT JOIN Persona p ON e.estudiante_ci = p.ci
        GROUP BY t.id
      `,
    });

    const tesisConAutores = result.rows.map((tesis) => ({
      ...tesis,
      autores: JSON.parse(tesis.autores || "[]"),
    }));

    console.log("Resultado obtenido:", tesisConAutores);
    res.json(tesisConAutores);
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
  const sql = `
    SELECT
      t.id, t.nombre, t.id_encargado, t.id_tutor, t.id_sede, t.fecha, t.estado,
      JSON_GROUP_ARRAY(
        JSON_OBJECT(
          'ci', p.ci,
          'nombre', p.nombre,
          'apellido', p.apellido,
          'email', p.email
        )
      ) FILTER (WHERE p.ci IS NOT NULL) as autores
    FROM Tesis t
    LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
    LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
    LEFT JOIN Persona p ON e.estudiante_ci = p.ci
    WHERE t.id = ?
    GROUP BY t.id
  `;
  console.log("Consulta SQL:", sql);

  try {
    const result = await db.execute(sql, [id]);
    console.log("Resultado obtenido:", result);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    const tesis = result.rows[0];
    tesis.autores = JSON.parse(tesis.autores || "[]");

    res.json(tesis);
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
  const sql = `
    SELECT
      t.id, t.nombre, t.id_encargado, t.id_tutor, t.id_sede, t.fecha, t.estado,
      JSON_GROUP_ARRAY(
        JSON_OBJECT(
          'ci', p.ci,
          'nombre', p.nombre,
          'apellido', p.apellido,
          'email', p.email
        )
      ) FILTER (WHERE p.ci IS NOT NULL) as autores
    FROM Tesis t
    LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
    LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
    LEFT JOIN Persona p ON e.estudiante_ci = p.ci
    WHERE t.nombre LIKE ?
    GROUP BY t.id
  `;
  const searchTerm = `%${nombre}%`; // Añade los comodines %

  console.log(`Buscando término:`, searchTerm);

  try {
    const result = await db.execute(sql, [searchTerm]); // Usando db.execute
    const rows = result.rows || result; // si db.execute devuelve { rows: [...] } o simplemente [...]

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    const tesisConAutores = rows.map((tesis) => ({
      ...tesis,
      autores: JSON.parse(tesis.autores || "[]"),
    }));

    res.json(tesisConAutores);
  } catch (err) {
    console.error("Error al obtener tesis por nombre:", err.message);
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

export const getTesisAutores = async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.ci, p.nombre, p.apellido, p.email
    FROM Persona p
    JOIN Estudiante e ON p.ci = e.estudiante_ci
    JOIN Alumno_tesis at ON e.estudiante_ci = at.id_estudiante
    WHERE at.id_tesis = ?;
  `;

  try {
    const result = await db.execute(sql, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getTesisAutores:", err.message);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

// Subir una nueva tesis
export const uploadTesis = async (req, res) => {
  console.log("DEBUG: Iniciando uploadTesis");
  console.log("DEBUG: req.body:", req.body);
  console.log("DEBUG: req.file:", req.file);

  let {
    nombre: nombre_tesis,
    id_estudiante,
    id_tutor,
    id_encargado,
    fecha,
    estado,
    nuevo_autor: new_estudiante_data,
    nuevo_tutor: new_tutor_data,
    nuevo_encargado: new_encargado_data,
  } = req.body;

  const nombre = nombre_tesis || req.body.titulo;

  const id_sede_str = req.body.id_sede;
  if (!id_sede_str) {
    console.error("ERROR: El campo id_sede es obligatorio.");
    return res
      .status(400)
      .json({ message: "El campo id_sede es obligatorio." });
  }
  const id_sede = parseInt(id_sede_str, 10);
  if (isNaN(id_sede)) {
    console.error("ERROR: El campo id_sede debe ser un número.");
    return res
      .status(400)
      .json({ message: "El campo id_sede debe ser un número." });
  }

  try {
    if (id_estudiante === "new") {
      console.log("DEBUG: Creando nuevo estudiante");
      const estudianteData = JSON.parse(new_estudiante_data);
      console.log("DEBUG: estudianteData (parsed):", estudianteData);
      estudianteData.ci = parseInt(estudianteData.cedula, 10);
      delete estudianteData.cedula;
      const existingEstudiante = await EstudianteRepository.getByCi(
        estudianteData.ci
      );
      if (existingEstudiante) {
        id_estudiante = existingEstudiante.ci;
        console.log(
          `DEBUG: Estudiante existente encontrado con CI: ${id_estudiante}`
        );
      } else {
        if (!estudianteData.email) {
          estudianteData.email = `${estudianteData.ci}@placeholder.com`;
        }
        if (!estudianteData.telefono) {
          estudianteData.telefono = "0000000";
        }
        if (!estudianteData.password) {
          estudianteData.password = String(estudianteData.ci); // Default password
        }
        if (!estudianteData.ci_type) {
          estudianteData.ci_type = "V"; // Default ci_type
        }
        await EstudianteService.create(estudianteData);
        id_estudiante = estudianteData.ci;
        console.log(`DEBUG: Nuevo estudiante creado con CI: ${id_estudiante}`);
      }
    }

    if (id_tutor === "new") {
      console.log("DEBUG: Creando nuevo tutor");
      const tutorData = JSON.parse(new_tutor_data);
      console.log("DEBUG: tutorData (parsed):", tutorData);
      tutorData.ci = parseInt(tutorData.cedula, 10);
      delete tutorData.cedula;
      const existingTutor = await ProfesorRepository.getProfesor(tutorData.ci);
      if (existingTutor) {
        id_tutor = existingTutor.ci;
        console.log(`DEBUG: Tutor existente encontrado con CI: ${id_tutor}`);
      } else {
        if (!tutorData.email) {
          tutorData.email = `${tutorData.ci}@placeholder.com`;
        }
        if (!tutorData.telefono) {
          tutorData.telefono = "0000000";
        }
        if (!tutorData.password) {
          tutorData.password = String(tutorData.ci); // Default password
        }
        if (!tutorData.ci_type) {
          tutorData.ci_type = "V"; // Default ci_type
        }
        await ProfesorService.create(tutorData);
        id_tutor = tutorData.ci;
        console.log(`DEBUG: Nuevo tutor creado con CI: ${id_tutor}`);
      }
    }

    if (id_encargado === "new") {
      console.log("DEBUG: Creando nuevo encargado");
      const encargadoData = JSON.parse(new_encargado_data);
      console.log("DEBUG: encargadoData (parsed):", encargadoData);
      encargadoData.ci = parseInt(encargadoData.cedula, 10);
      delete encargadoData.cedula;
      const existingEncargado = await EncargadoRepository.getEncargado(
        encargadoData.ci
      );
      if (existingEncargado) {
        id_encargado = existingEncargado.ci;
        console.log(
          `DEBUG: Encargado existente encontrado con CI: ${id_encargado}`
        );
      } else {
        if (!encargadoData.email) {
          encargadoData.email = `${encargadoData.ci}@placeholder.com`;
        }
        if (!encargadoData.telefono) {
          encargadoData.telefono = "0000000";
        }
        encargadoData.id_sede = id_sede; // Asegurarse de que id_sede se pasa
        if (!encargadoData.password) {
          encargadoData.password = String(encargadoData.ci); // Default password
        }
        if (!encargadoData.ci_type) {
          encargadoData.ci_type = "V"; // Default ci_type
        }
        await EncargadoService.create(encargadoData);
        id_encargado = encargadoData.ci;
        console.log(`DEBUG: Nuevo encargado creado con CI: ${id_encargado}`);
      }
    }

    if (!req.file || !req.file.buffer) {
      console.error("ERROR: El archivo PDF es obligatorio");
      return res.status(400).json({ message: "El archivo PDF es obligatorio" });
    }

    const archivo_pdf = Buffer.from(req.file.buffer);
    console.log(
      `DEBUG: Buffer de archivo PDF creado con tamaño: ${archivo_pdf.length}`
    );

    let archivoUrl = null;
    let teraboxFsId = null;
    try {
      console.log("DEBUG: Subiendo a Terabox...");
      const details = await uploadBufferToTerabox(
        archivo_pdf,
        req.file.originalname,
        "/tesis"
      );
      console.log("DEBUG: Detalles de Terabox:", details);
      teraboxFsId = details?.fs_id || null;
      if (teraboxFsId) {
        const link = await getDownloadLinkFromFsId(teraboxFsId);
        archivoUrl = link?.downloadLink || null;
      }
      console.log(
        `DEBUG: Terabox - fs_id: ${teraboxFsId}, dlink: ${archivoUrl}`
      );
    } catch (e) {
      console.error("ERROR: Error subiendo a Terabox:", e.message);
      return res
        .status(500)
        .json({ message: "Error subiendo a almacenamiento", error: e.message });
    }

    const sqlTesis = `
        INSERT INTO Tesis (id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_url, terabox_fs_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      parseInt(id_encargado, 10),
      id_sede,
      parseInt(id_tutor, 10),
      nombre,
      fecha,
      estado.toLowerCase() === "aprobada"
        ? "aprobado"
        : estado.toLowerCase() === "en revision"
        ? "en revisión"
        : estado.toLowerCase(), // Corregir estado
      archivoUrl,
      teraboxFsId ? String(teraboxFsId) : null, // Convertir a String
    ];
    console.log("DEBUG: SQL para insertar Tesis:", sqlTesis);
    console.log("DEBUG: Parámetros para SQL:", params);

    const result = await db.execute(sqlTesis, params);
    console.log("DEBUG: Resultado de la inserción en Tesis:", result);

    const newTesisId = Number(result.lastInsertRowid);
    console.log(`DEBUG: Tesis añadida con ID: ${newTesisId}`);

    let idEstudiantes;
    if (typeof id_estudiante === "string") {
      idEstudiantes = id_estudiante
        .split(",")
        .map((id) => parseInt(id.trim(), 10));
    } else if (Array.isArray(id_estudiante)) {
      idEstudiantes = id_estudiante.map((id) => parseInt(id, 10));
    } else {
      idEstudiantes = [parseInt(id_estudiante, 10)];
    }

    for (const id of idEstudiantes) {
      if (isNaN(id)) {
        console.error(
          "ERROR: Uno de los IDs de estudiante no es un número entero válido."
        );
        continue; // O manejar el error como se prefiera
      }

      const fakeReq = {
        body: {
          id_estudiante: id,
          id_tesis: newTesisId,
        },
      };
      console.log(
        "DEBUG: Fake request para postAlumnoTesisController:",
        fakeReq
      );

      const fakeRes = {
        json: (response) =>
          console.log("DEBUG: Respuesta de alumno_tesis:", response),
        status: (statusCode) => ({
          json: (response) =>
            console.log(
              `DEBUG: Error ${statusCode} en alumno_tesis:`,
              response
            ),
        }),
      };

      await postAlumnoTesisController(fakeReq, fakeRes);
    }

    console.log("DEBUG: Proceso de subida de tesis finalizado con éxito.");
    return res.json({
      message: "Tesis subida correctamente y autor asociado",
      id_tesis: newTesisId,
      archivo_url: archivoUrl,
      terabox_fs_id: teraboxFsId,
    });
  } catch (error) {
    console.error("ERROR: Error al subir la tesis o asociar el autor:", error);
    return res
      .status(500)
      .json({ message: "Error al subir la tesis o asociar el autor", error });
  }
};

export const downloadTesis = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido:", id);

  try {
    const result = await db.execute(
      "SELECT archivo_url, terabox_fs_id FROM Tesis WHERE id = ?",
      [id]
    );
    const row = result?.rows?.[0];
    if (!row) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    if (row.terabox_fs_id) {
      // Get a fresh download link right before the download attempt
      console.log("Obteniendo enlace de descarga...");
      const link = await getDownloadLinkFromFsId(row.terabox_fs_id);
      const fileLink = link?.downloadLink;

      if (!fileLink) {
        if (row.archivo_url) {
          console.log(
            "No se pudo obtener el enlace de Terabox, usando URL de respaldo."
          );
          return res.redirect(row.archivo_url);
        }
        throw new Error(
          "No se pudo obtener el enlace de descarga y no hay URL de respaldo."
        );
      }

      console.log(`Intentando descargar desde: ${fileLink}`);

      const response = await axios({
        method: "GET",
        url: fileLink,
        responseType: "stream",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://www.terabox.com/",
          Cookie: `ndus=${process.env.TERABOX_NDUS}`,
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="tesis_${id}.pdf"`
      );
      response.data.pipe(res);

      // Handle errors on the stream
      response.data.on("error", (streamError) => {
        console.error("Error en el stream de descarga:", streamError);
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: "Error durante la descarga del archivo." });
        }
      });
    } else if (row.archivo_url) {
      return res.redirect(row.archivo_url);
    } else {
      return res.status(404).json({ message: "Archivo no disponible" });
    }
  } catch (err) {
    console.error("Error al descargar el archivo:", err.message);
    // Try to fallback if the error happened during download
    try {
      const result = await db.execute(
        "SELECT archivo_url FROM Tesis WHERE id = ?",
        [id]
      );
      const row = result?.rows?.[0];
      if (row?.archivo_url) {
        console.log(
          "Error en la descarga principal, intentando fallback a archivo_url."
        );
        return res.redirect(row.archivo_url);
      }
    } catch (fallbackError) {
      console.error(
        "Error durante el intento de fallback:",
        fallbackError.message
      );
    }
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
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
  let {
    nombre: nombre_tesis, // Renombrar para evitar conflictos
    id_estudiante,
    id_tutor,
    id_encargado,
    fecha,
    estado,
    nuevo_autor: new_estudiante_data,
    nuevo_tutor: new_tutor_data,
    nuevo_encargado: new_encargado_data,
  } = req.body;

  // Aceptar 'titulo' o 'nombre' para el nombre de la tesis
  const nombre = nombre_tesis || req.body.titulo;

  const id_sede_str = req.body.id_sede;
  if (!id_sede_str) {
    return res
      .status(400)
      .json({ message: "El campo id_sede es obligatorio." });
  }
  const id_sede = parseInt(id_sede_str, 10);
  if (isNaN(id_sede)) {
    return res
      .status(400)
      .json({ message: "El campo id_sede debe ser un número." });
  }

  try {
    if (id_estudiante === "new") {
      const estudianteData = JSON.parse(new_estudiante_data);
      estudianteData.ci = parseInt(estudianteData.cedula, 10);
      delete estudianteData.cedula;
      const existingEstudiante = await EstudianteRepository.getByCi(
        estudianteData.ci
      );
      if (existingEstudiante) {
        id_estudiante = existingEstudiante.ci;
      } else {
        if (!estudianteData.email) {
          estudianteData.email = `${estudianteData.ci}@placeholder.com`;
        }
        if (!estudianteData.telefono) {
          estudianteData.telefono = "0000000";
        }
        if (!estudianteData.password) {
          estudianteData.password = String(estudianteData.ci); // Default password
        }
        if (!estudianteData.ci_type) {
          estudianteData.ci_type = "V"; // Default ci_type
        }
        await EstudianteService.create(estudianteData);
        id_estudiante = estudianteData.ci;
      }
    }

    if (id_tutor === "new") {
      const tutorData = JSON.parse(new_tutor_data);
      tutorData.ci = parseInt(tutorData.cedula, 10);
      delete tutorData.cedula;
      const existingTutor = await ProfesorRepository.getProfesor(tutorData.ci);
      if (existingTutor) {
        id_tutor = existingTutor.ci;
      } else {
        if (!tutorData.email) {
          tutorData.email = `${tutorData.ci}@placeholder.com`;
        }
        if (!tutorData.telefono) {
          tutorData.telefono = "0000000";
        }
        if (!tutorData.password) {
          tutorData.password = String(tutorData.ci); // Default password
        }
        if (!tutorData.ci_type) {
          tutorData.ci_type = "V"; // Default ci_type
        }
        await ProfesorService.create(tutorData);
        id_tutor = tutorData.ci;
      }
    }

    if (id_encargado === "new") {
      const encargadoData = JSON.parse(new_encargado_data);
      encargadoData.ci = parseInt(encargadoData.cedula, 10);
      delete encargadoData.cedula;
      const existingEncargado = await EncargadoRepository.getEncargado(
        encargadoData.ci
      );
      if (existingEncargado) {
        id_encargado = existingEncargado.ci;
      } else {
        if (!encargadoData.email) {
          encargadoData.email = `${encargadoData.ci}@placeholder.com`;
        }
        if (!encargadoData.telefono) {
          encargadoData.telefono = "0000000";
        }
        encargadoData.id_sede = id_sede;
        if (!encargadoData.password) {
          encargadoData.password = String(encargadoData.ci); // Default password
        }
        if (!encargadoData.ci_type) {
          encargadoData.ci_type = "V"; // Default ci_type
        }
        await EncargadoService.create(encargadoData);
        id_encargado = encargadoData.ci;
      }
    }

    let archivoUrl = null;
    let teraboxFsId = null;

    if (req.file && req.file.buffer) {
      const archivo_pdf = Buffer.from(req.file.buffer);
      try {
        const details = await uploadBufferToTerabox(
          archivo_pdf,
          req.file.originalname,
          "/tesis"
        );
        teraboxFsId = details?.fs_id || null;
        if (teraboxFsId) {
          const link = await getDownloadLinkFromFsId(teraboxFsId);
          archivoUrl = link?.downloadLink || null;
        }
      } catch (e) {
        console.error("Error subiendo a Terabox:", e.message);
        return res.status(500).json({
          message: "Error subiendo a almacenamiento",
          error: e.message,
        });
      }
    }

    let query = `UPDATE Tesis SET nombre = ?, fecha = ?, estado = ?, id_encargado = ?, id_sede = ?, id_tutor = ?`;
    let params = [
      nombre,
      fecha,
      estado.toLowerCase() === "aprobada"
        ? "aprobado"
        : estado.toLowerCase() === "en revision"
        ? "en revisión"
        : estado.toLowerCase(),
      id_encargado,
      id_sede,
      id_tutor,
    ];

    if (archivoUrl) {
      query += `, archivo_url = ?, terabox_fs_id = ?`;
      params.push(archivoUrl, teraboxFsId);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const result = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tesis no encontrada." });
    }

    // Actualizar la asociación del estudiante
    const deleteAutoresSql = `DELETE FROM Alumno_tesis WHERE id_tesis = ?`;
    await db.execute(deleteAutoresSql, [id]);

    let idEstudiantes;
    if (typeof id_estudiante === "string") {
      idEstudiantes = id_estudiante
        .split(",")
        .map((id) => parseInt(id.trim(), 10));
    } else if (Array.isArray(id_estudiante)) {
      idEstudiantes = id_estudiante.map((id) => parseInt(id, 10));
    } else {
      idEstudiantes = [parseInt(id_estudiante, 10)];
    }

    for (const autorId of idEstudiantes) {
      if (isNaN(autorId)) {
        console.error(
          "ERROR: Uno de los IDs de estudiante no es un número entero válido."
        );
        continue; // O manejar el error como se prefiera
      }
      const insertAutorSql = `INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)`;
      await db.execute(insertAutorSql, [autorId, id]);
    }

    return res
      .status(200)
      .json({ message: "Tesis actualizada correctamente." });
  } catch (err) {
    console.error("Error al actualizar la tesis:", err.message);
    return res.status(500).json({
      message: "Hubo un error al actualizar la tesis.",
      error: err.message,
    });
  }
};
