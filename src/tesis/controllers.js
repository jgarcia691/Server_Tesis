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

/**
 * Función auxiliar para obtener o crear un usuario (estudiante, profesor, encargado).
 * @param {string} userType - Tipo de usuario ('estudiante', 'tutor', 'encargado').
 * @param {string} userId - ID del usuario o 'new' para crear uno nuevo.
 * @param {string} newUserDataString - Datos del nuevo usuario en formato JSON string.
 * @param {number} id_sede - ID de la sede (necesario para encargados).
 * @returns {Promise<number>} - El CI del usuario.
 */
async function getOrCreateUser(userType, userId, newUserDataString, id_sede) {
  if (userId !== "new") {
    return parseInt(userId, 10);
  }

  console.log(`DEBUG: Creando nuevo ${userType}`);
  const userData = JSON.parse(newUserDataString);
  userData.ci = parseInt(userData.cedula, 10);
  delete userData.cedula;

  const services = {
    estudiante: { repo: EstudianteRepository, service: EstudianteService },
    tutor: { repo: ProfesorRepository, service: ProfesorService },
    encargado: { repo: EncargadoRepository, service: EncargadoService },
  };

  const { repo, service } = services[userType];
  const existingUser =
    (await repouserType) === "tutor"
      ? "getProfesor"
      : userType === "estudiante"
      ? "getByCi"
      : "getEncargado";

  if (existingUser) {
    console.log(
      `DEBUG: ${userType} existente encontrado con CI: ${existingUser.ci}`
    );
    return existingUser.ci;
  }

  // Asignar valores por defecto si no existen
  userData.email = userData.email || `${userData.ci}@placeholder.com`;
  userData.telefono = userData.telefono || "0000000";
  userData.password = userData.password || String(userData.ci);
  userData.ci_type = userData.ci_type || "V";
  if (userType === "encargado") userData.id_sede = id_sede;

  await service.create(userData);
  console.log(`DEBUG: Nuevo ${userType} creado con CI: ${userData.ci}`);
  return userData.ci;
}

export const getTesis = async (req, res, next) => {
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
    next(err);
  }
};

// Obtener una tesis por ID (con PDF)
export const getTesisById = async (req, res, next) => {
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
    next(err);
  }
};

// Obtener una tesis por nombre (con PDF)
export const getTesisByName = async (req, res, next) => {
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
    next(err);
  }
};

export const getTesisAutores = async (req, res, next) => {
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
    next(err);
  }
};

// Subir una nueva tesis
export const uploadTesis = async (req, res, next) => {
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
    return next(new Error("El campo id_sede es obligatorio."));
  }
  const id_sede = parseInt(id_sede_str, 10);
  if (isNaN(id_sede)) {
    return next(new Error("El campo id_sede debe ser un número."));
  }

  try {
    // Obtener o crear los usuarios necesarios
    id_estudiante = await getOrCreateUser(
      "estudiante",
      id_estudiante,
      new_estudiante_data,
      id_sede
    );
    id_tutor = await getOrCreateUser(
      "tutor",
      id_tutor,
      new_tutor_data,
      id_sede
    );
    id_encargado = await getOrCreateUser(
      "encargado",
      id_encargado,
      new_encargado_data,
      id_sede
    );

    if (!req.file || !req.file.buffer) {
      return next(new Error("El archivo PDF es obligatorio"));
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
      return next(e);
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
        return next(
          new Error(
            "Uno de los IDs de estudiante no es un número entero válido."
          )
        );
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
    next(error);
  }
};

export const downloadTesis = async (req, res, next) => {
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
        if (!res.headersSent) {
          return next(streamError);
        }
      });
    } else if (row.archivo_url) {
      return res.redirect(row.archivo_url);
    } else {
      return res.status(404).json({ message: "Archivo no disponible" });
    }
  } catch (err) {
    next(err);
  }
};

// Eliminar una tesis
export const deleteTesis = async (req, res, next) => {
  const { id } = req.params;
  const sql = "DELETE FROM Tesis WHERE id = ?";

  try {
    const result = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    return res.json({ message: "Tesis eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};

// Actualizar una tesis
export const updateTesis = async (req, res, next) => {
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
    return next(new Error("El campo id_sede es obligatorio."));
  }
  const id_sede = parseInt(id_sede_str, 10);
  if (isNaN(id_sede)) {
    return next(new Error("El campo id_sede debe ser un número."));
  }

  try {
    // Obtener o crear los usuarios necesarios
    id_estudiante = await getOrCreateUser(
      "estudiante",
      id_estudiante,
      new_estudiante_data,
      id_sede
    );
    id_tutor = await getOrCreateUser(
      "tutor",
      id_tutor,
      new_tutor_data,
      id_sede
    );
    id_encargado = await getOrCreateUser(
      "encargado",
      id_encargado,
      new_encargado_data,
      id_sede
    );

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
        teraboxFsId = details?.fs_.id || null;
        if (teraboxFsId) {
          const link = await getDownloadLinkFromFsId(teraboxFsId);
          archivoUrl = link?.downloadLink || null;
        }
      } catch (e) {
        return next(e);
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
        return next(
          new Error(
            "Uno de los IDs de estudiante no es un número entero válido."
          )
        );
      }
      const insertAutorSql = `INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)`;
      await db.execute(insertAutorSql, [autorId, id]);
    }

    return res
      .status(200)
      .json({ message: "Tesis actualizada correctamente." });
  } catch (err) {
    next(err);
  }
};
