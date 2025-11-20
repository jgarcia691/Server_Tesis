import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import db from "../../config/db.js";
import axios from "axios";
import https from "https";
import JSZip from "jszip";
import {
  uploadBufferToTerabox,
  getDownloadLinkFromFsId,
} from "../../config/terabox.js";
import { updateTesisStatus as updateTesisStatusService } from "./services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Almacenamiento de Progreso de Descarga (en memoria) ---
const downloadProgress = new Map(); // jobId -> { status, progress, total, current, successCount, errorCount, errors, zipBuffer, createdAt }

// Limpiar progresos antiguos (más de 1 hora)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [jobId, progress] of downloadProgress.entries()) {
    if (progress.createdAt < oneHourAgo) {
      downloadProgress.delete(jobId);
    }
  }
}, 30 * 60 * 1000); // Ejecutar cada 30 minutos

// --- Función Auxiliar para Normalizar Estado ---
const normalizeEstado = (estadoBruto) => {
  if (!estadoBruto) return "pendiente";
  const estadoLimpio = estadoBruto.toLowerCase().trim();
  if (estadoLimpio.includes("en revision")) return "en revisión";
  if (estadoLimpio.includes("aprobada")) return "aprobado";
  if (estadoLimpio.includes("rechazada")) return "rechazado";
  if (
    ["aprobado", "rechazado", "pendiente", "en revisión"].includes(estadoLimpio)
  ) {
    return estadoLimpio;
  }
  return "pendiente";
};

// --- Función Auxiliar para asegurar que los IDs sean un Array ---
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") return [data];
  return [];
};

// --- OBTENER TODAS LAS TESIS (CON AUTORES Y JURADOS) ---
export const getTesis = async (req, res, next) => {
  try {
    // Debug: Log de parámetros recibidos
    console.log("DEBUG: Parámetros recibidos:", req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    // Extraer TODOS los filtros de query parameters
    const {
      cadena,
      estado,
      id_sede,
      id_tutor,
      id_encargado,
      id_estudiante,
      nombre,
      fecha_desde,
      fecha_hasta,
    } = req.query;

    // Construir condiciones WHERE dinámicamente
    const whereConditions = [];
    const queryArgs = [];

    // Búsqueda por cadena (busca en nombre de tesis y nombres de autores)
    if (cadena) {
      const searchTerm = `%${cadena}%`;
      whereConditions.push(
        `(t.nombre LIKE ? OR p_aut.nombre LIKE ? OR p_aut.apellido LIKE ? OR 
         (p_aut.nombre || ' ' || p_aut.apellido) LIKE ?)`
      );
      queryArgs.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Filtro por nombre exacto o parcial
    if (nombre) {
      whereConditions.push("t.nombre LIKE ?");
      queryArgs.push(`%${nombre}%`);
    }

    // Filtro por estado
    if (estado) {
      whereConditions.push("t.estado = ?");
      queryArgs.push(normalizeEstado(estado));
    }

    // Filtro por sede
    if (id_sede) {
      const idSedeNum = parseInt(id_sede, 10);
      if (!isNaN(idSedeNum)) {
        whereConditions.push("t.id_sede = ?");
        queryArgs.push(idSedeNum);
      }
    }

    // Filtro por tutor
    if (id_tutor) {
      const idTutorNum = parseInt(id_tutor, 10);
      if (!isNaN(idTutorNum)) {
        whereConditions.push("t.id_tutor = ?");
        queryArgs.push(idTutorNum);
      }
    }

    // Filtro por encargado
    if (id_encargado) {
      const idEncargadoNum = parseInt(id_encargado, 10);
      if (!isNaN(idEncargadoNum)) {
        whereConditions.push("t.id_encargado = ?");
        queryArgs.push(idEncargadoNum);
      }
    }

    // Filtro por estudiante/autor (requiere JOIN con Alumno_tesis)
    if (id_estudiante) {
      const idEstudianteNum = parseInt(id_estudiante, 10);
      if (!isNaN(idEstudianteNum)) {
        whereConditions.push("at.id_estudiante = ?");
        queryArgs.push(idEstudianteNum);
      }
    }

    // Filtro por fecha desde
    if (fecha_desde) {
      whereConditions.push("t.fecha >= ?");
      queryArgs.push(fecha_desde);
    }

    // Filtro por fecha hasta
    if (fecha_hasta) {
      whereConditions.push("t.fecha <= ?");
      queryArgs.push(fecha_hasta);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Debug: Log de filtros aplicados
    console.log("DEBUG: Filtros aplicados:", whereConditions);
    console.log("DEBUG: Argumentos de query:", queryArgs);

    // Construir la consulta base con JOINs necesarios
    // Siempre incluimos los JOINs para obtener autores, jurados, encargado y tutor
    const baseQuery = `
      FROM Tesis t
      LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
      LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
      LEFT JOIN Persona p_aut ON e.estudiante_ci = p_aut.ci
      LEFT JOIN Jurado tj ON t.id = tj.id_tesis 
      LEFT JOIN Profesor pr_jur ON tj.id_profesor = pr_jur.profesor_ci 
      LEFT JOIN Persona p_jur ON pr_jur.profesor_ci = p_jur.ci
      LEFT JOIN Encargado enc ON t.id_encargado = enc.encargado_ci
      LEFT JOIN Persona p_enc ON enc.encargado_ci = p_enc.ci
      LEFT JOIN Profesor pr_tut ON t.id_tutor = pr_tut.profesor_ci
      LEFT JOIN Persona p_tut ON pr_tut.profesor_ci = p_tut.ci
      ${whereClause}
    `;

    // Obtener el conteo total de tesis con filtros aplicados
    // Usamos DISTINCT porque los JOINs pueden duplicar registros
    const countSql = `SELECT COUNT(DISTINCT t.id) as total ${baseQuery}`;
    console.log("DEBUG: Query de conteo:", countSql);
    
    const countResult = await db.execute({
      sql: countSql,
      args: queryArgs,
    });
    const total = countResult.rows[0].total;
    console.log("DEBUG: Total de registros después de filtros:", total);

    // Construir la consulta principal con filtros
    // 💡 CORRECCIÓN: Se añadieron t.id_encargado y t.id_tutor al SELECT
    const result = await db.execute({
      sql: `
        SELECT
          t.id, t.nombre, t.id_sede, t.id_encargado, t.id_tutor, t.fecha, t.estado, t.archivo_url,
          MAX(JSON_OBJECT(
            'ci', p_enc.ci, 'nombre', p_enc.nombre, 'apellido', p_enc.apellido, 
            'ci_type', p_enc.ci_type, 'email', p_enc.email, 'telefono', p_enc.telefono,
            'id_sede', enc.id_sede
          )) as encargado,
          MAX(JSON_OBJECT(
            'ci', p_tut.ci, 'nombre', p_tut.nombre, 'apellido', p_tut.apellido,
            'ci_type', p_tut.ci_type, 'email', p_tut.email, 'telefono', p_tut.telefono
          )) as tutor,
          JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
            'ci', p_aut.ci, 'nombre', p_aut.nombre, 'apellido', p_aut.apellido, 'ci_type', p_aut.ci_type
          )) FILTER (WHERE p_aut.ci IS NOT NULL) as autores,
          JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
            'ci', p_jur.ci, 'nombre', p_jur.nombre, 'apellido', p_jur.apellido, 'ci_type', p_jur.ci_type
          )) FILTER (WHERE p_jur.ci IS NOT NULL) as jurados
        ${baseQuery}
        GROUP BY t.id
        ORDER BY ` + (req.query.sortBy === 'nombre' ? 't.nombre' : req.query.sortBy === 'fecha' ? 't.fecha' : 't.id') + " " + (req.query.order === 'asc' ? 'ASC' : 'DESC') + `
        LIMIT ? OFFSET ?
      `,
      args: [...queryArgs, limit, offset],
    });

    console.log("DEBUG: Registros obtenidos en esta página:", result.rows.length);

    const tesisConAutores = result.rows.map((tesis) => ({
      ...tesis,
      encargado: tesis.encargado ? JSON.parse(tesis.encargado) : null,
      tutor: tesis.tutor ? JSON.parse(tesis.tutor) : null,
      autores: JSON.parse(tesis.autores || "[]"),
      jurados: JSON.parse(tesis.jurados || "[]"),
    }));

    res.json({
      page,
      limit,
      total, // Total de registros que cumplen los filtros
      data: tesisConAutores,
    });
  } catch (err) {
    console.error("DEBUG: Error en getTesis:", err);
    next(err);
  }
};

export const getTesisById = async (req, res, next) => {
  const { id } = req.params;
  // 💡 CORRECCIÓN: Asegurando que id_encargado y id_tutor estén en el SELECT también aquí
  const sql = `
    SELECT
      t.id, t.nombre, t.id_encargado, t.id_tutor, t.id_sede, t.fecha, t.estado, t.archivo_url,
      JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
        'ci', p_aut.ci, 'nombre', p_aut.nombre, 'apellido', p_aut.apellido, 'ci_type', p_aut.ci_type
      )) FILTER (WHERE p_aut.ci IS NOT NULL) as autores,
      JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
        'ci', p_jur.ci, 'nombre', p_jur.nombre, 'apellido', p_jur.apellido, 'ci_type', p_jur.ci_type
      )) FILTER (WHERE p_jur.ci IS NOT NULL) as jurados
    FROM Tesis t
    LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
    LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
    LEFT JOIN Persona p_aut ON e.estudiante_ci = p_aut.ci
    LEFT JOIN Jurado tj ON t.id = tj.id_tesis 
    LEFT JOIN Profesor pr ON tj.id_profesor = pr.profesor_ci 
    LEFT JOIN Persona p_jur ON pr.profesor_ci = p_jur.ci
    WHERE t.id = ?
    GROUP BY t.id
  `;

  try {
    const result = await db.execute({ sql: sql, args: [id] });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    const tesis = result.rows[0];
    tesis.autores = JSON.parse(tesis.autores || "[]");
    tesis.jurados = JSON.parse(tesis.jurados || "[]");

    res.json(tesis);
  } catch (err) {
    next(err);
  }
};

export const getTesisByName = async (req, res, next) => {
  const { nombre } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const searchTerm = `%${nombre}%`;

  try {
    // Obtener el conteo total de tesis que coinciden con la búsqueda
    const countResult = await db.execute({
      sql: "SELECT COUNT(*) as total FROM Tesis WHERE nombre LIKE ?",
      args: [searchTerm],
    });
    const total = countResult.rows[0].total;

    // Si no hay resultados, devolver una respuesta vacía en lugar de 404
    if (total === 0) {
      return res.json({
        page,
        limit,
        total: 0,
        data: [],
      });
    }

    // 💡 CORRECCIÓN: Se añadieron t.id_encargado y t.id_tutor al SELECT
    const sql = `
    SELECT
      t.id, t.nombre, t.id_sede, t.id_encargado, t.id_tutor, t.fecha, t.estado,
      MAX(JSON_OBJECT(
        'ci', p_enc.ci, 'nombre', p_enc.nombre, 'apellido', p_enc.apellido, 
        'ci_type', p_enc.ci_type, 'email', p_enc.email, 'telefono', p_enc.telefono,
        'id_sede', enc.id_sede
      )) as encargado,
      MAX(JSON_OBJECT(
        'ci', p_tut.ci, 'nombre', p_tut.nombre, 'apellido', p_tut.apellido,
        'ci_type', p_tut.ci_type, 'email', p_tut.email, 'telefono', p_tut.telefono
      )) as tutor,
      JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
        'ci', p_aut.ci, 'nombre', p_aut.nombre, 'apellido', p_aut.apellido
      )) FILTER (WHERE p_aut.ci IS NOT NULL) as autores,
      JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
        'ci', p_jur.ci, 'nombre', p_jur.nombre, 'apellido', p_jur.apellido, 'ci_type', p_jur.ci_type
      )) FILTER (WHERE p_jur.ci IS NOT NULL) as jurados
    FROM Tesis t
    LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
    LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
    LEFT JOIN Persona p_aut ON e.estudiante_ci = p_aut.ci
    LEFT JOIN Jurado tj ON t.id = tj.id_tesis 
    LEFT JOIN Profesor pr_jur ON tj.id_profesor = pr_jur.profesor_ci 
    LEFT JOIN Persona p_jur ON pr_jur.profesor_ci = p_jur.ci
    LEFT JOIN Encargado enc ON t.id_encargado = enc.encargado_ci
    LEFT JOIN Persona p_enc ON enc.encargado_ci = p_enc.ci
    LEFT JOIN Profesor pr_tut ON t.id_tutor = pr_tut.profesor_ci
    LEFT JOIN Persona p_tut ON pr_tut.profesor_ci = p_tut.ci
    WHERE t.nombre LIKE ?
    GROUP BY t.id
    LIMIT ? OFFSET ?
  `;

    const result = await db.execute({
      sql,
      args: [searchTerm, limit, offset],
    });

    const rows = result.rows || [];

    const tesisConAutores = rows.map((tesis) => ({
      ...tesis,
      encargado: tesis.encargado ? JSON.parse(tesis.encargado) : null,
      tutor: tesis.tutor ? JSON.parse(tesis.tutor) : null,
      autores: JSON.parse(tesis.autores || "[]"),
      jurados: JSON.parse(tesis.jurados || "[]"),
    }));

    res.json({
      page,
      limit,
      total, // Usar el conteo total real
      data: tesisConAutores,
    });
  } catch (err) {
    next(err);
  }
};

// --- OBTENER AUTORES DE UNA TESIS (Ruta restaurada) ---
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
    const result = await db.execute({ sql: sql, args: [id] });
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// --- CREAR NUEVA TESIS (POST) ---
export const uploadTesis = async (req, res, next) => {
  console.log("DEBUG: Iniciando uploadTesis");
  console.log("DEBUG: req.body:", req.body);
  console.log("DEBUG: req.file:", req.file);

  const {
    nombre,
    id_tutor,
    id_encargado,
    fecha,
    estado,
    id_sede,
    id_estudiantes,
    id_jurados,
  } = req.body;

  // Validaciones obligatorias
  if (
    !nombre ||
    !id_tutor ||
    !id_encargado ||
    !fecha ||
    !estado ||
    !id_sede ||
    !id_estudiantes ||
    !id_jurados
  ) {
    return next(new Error("Todos los campos son obligatorios."));
  }

  const idSedeNum = parseInt(id_sede, 10);
  const idTutorNum = parseInt(id_tutor, 10);
  const idEncargadoNum = parseInt(id_encargado, 10);

  if (isNaN(idSedeNum) || isNaN(idTutorNum) || isNaN(idEncargadoNum)) {
    return next(new Error("Los campos deben ser números."));
  }

  if (!req.file || !req.file.buffer) {
    return next(new Error("El archivo PDF es obligatorio."));
  }

  const trx = await db.transaction();

  try {
    const archivo_pdf = Buffer.from(req.file.buffer);
    console.log(
      `DEBUG: Buffer de archivo PDF creado con tamaño: ${archivo_pdf.length}`
    );

    const idEstudiantesArray = ensureArray(id_estudiantes);
    const autoresDetails = [];

    for (const autorId of idEstudiantesArray) {
      const autorIdNum = parseInt(autorId, 10);
      if (isNaN(autorIdNum)) continue;

      const result = await trx.execute({
        sql: "SELECT ci_type, ci FROM Persona WHERE ci = ?",
        args: [autorIdNum],
      });

      if (result.rows.length > 0) {
        autoresDetails.push(result.rows[0]);
      }
    }

    const folderName = autoresDetails
      .map((autor) => `${autor.ci_type}-${autor.ci}`)
      .join("_");
    const teraboxPath = `/tesis/${folderName}`;

    let archivoUrl = null;
    let teraboxFsId = null;
    try {
      console.log("DEBUG: Subiendo a Terabox...");
      const details = await uploadBufferToTerabox(
        archivo_pdf,
        req.file.originalname,
        teraboxPath
      );
      teraboxFsId = details?.fs_id || null;
      if (teraboxFsId) {
        const link = await getDownloadLinkFromFsId(teraboxFsId);
        archivoUrl = link?.downloadLink || null;
      }
      console.log(
        `DEBUG: Terabox - fs_id: ${teraboxFsId}, dlink: ${archivoUrl}`
      );
    } catch (e) {
      throw new Error(`Error subiendo a Terabox: ${e.message}`);
    }

    const sqlTesis = `
      INSERT INTO Tesis (id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_url, terabox_fs_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      idEncargadoNum,
      idSedeNum,
      idTutorNum,
      nombre,
      fecha,
      normalizeEstado(estado),
      archivoUrl,
      teraboxFsId ? String(teraboxFsId) : null,
    ];

    const result = await trx.execute({ sql: sqlTesis, args: params });
    const newTesisId = Number(result.lastInsertRowid);
    console.log(`DEBUG: Tesis añadida con ID: ${newTesisId}`);

    for (const autorIdStr of idEstudiantesArray) {
      const autorId = parseInt(autorIdStr, 10);
      if (isNaN(autorId)) continue;
      await trx.execute({
        sql: "INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)",
        args: [autorId, newTesisId],
      });
    }

    const idJuradosArray = ensureArray(id_jurados);
    for (const juradoIdStr of idJuradosArray) {
      const juradoId = parseInt(juradoIdStr, 10);
      if (isNaN(juradoId)) continue;
      await trx.execute({
        sql: "INSERT INTO Jurado (id_tesis, id_profesor) VALUES (?, ?)",
        args: [newTesisId, juradoId],
      });
    }

    await trx.commit();

    console.log("DEBUG: Proceso de subida de tesis finalizado con éxito.");
    return res.json({
      message: "Tesis subida correctamente y autor asociado",
      id_tesis: newTesisId,
      archivo_url: archivoUrl,
      terabox_fs_id: teraboxFsId,
    });
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

// --- ACTUALIZAR TESIS (PUT) ---
export const updateTesis = async (req, res, next) => {
  const { id } = req.params;
  console.log(`DEBUG: Iniciando updateTesis para ID: ${id}`);
  console.log("DEBUG: req.body:", req.body);

  const {
    nombre,
    id_tutor,
    id_encargado,
    fecha,
    estado,
    id_sede,
    id_estudiantes,
    id_jurados,
  } = req.body;

  // Definido en el ámbito superior
  const idEstudiantesArray = ensureArray(id_estudiantes);
  const idJuradosArray = ensureArray(id_jurados);

  const idSedeNum = parseInt(id_sede, 10);
  if (isNaN(idSedeNum)) {
    return next(new Error("El campo id_sede debe ser un número."));
  }

  const trx = await db.transaction();

  try {
    let archivoUrl = null;
    let teraboxFsId = null;

    if (req.file && req.file.buffer) {
      console.log("DEBUG: Subiendo nuevo archivo PDF a Terabox...");
      const archivo_pdf = Buffer.from(req.file.buffer);

      const autoresDetails = [];

      // Usar idEstudiantesArray aquí
      for (const autorId of idEstudiantesArray) {
        const autorIdNum = parseInt(autorId, 10);
        if (isNaN(autorIdNum)) continue;

        const result = await trx.execute({
          sql: "SELECT ci_type, ci FROM Persona WHERE ci = ?",
          args: [autorIdNum],
        });

        if (result.rows.length > 0) {
          autoresDetails.push(result.rows[0]);
        }
      }

      const folderName = autoresDetails
        .map((autor) => `${autor.ci_type}-${autor.ci}`)
        .join("_");
      const teraboxPath = `/tesis/${folderName}`;

      try {
        const details = await uploadBufferToTerabox(
          archivo_pdf,
          req.file.originalname,
          teraboxPath
        );
        teraboxFsId = details?.fs_id || null;
        if (teraboxFsId) {
          const link = await getDownloadLinkFromFsId(teraboxFsId);
          archivoUrl = link?.downloadLink || null;
        }
        console.log(
          `DEBUG: Nuevo Terabox - fs_id: ${teraboxFsId}, dlink: ${archivoUrl}`
        );
      } catch (e) {
        throw new Error(`Error subiendo a Terabox: ${e.message}`);
      }
    }

    let query = `UPDATE Tesis SET nombre = ?, fecha = ?, estado = ?, id_encargado = ?, id_sede = ?, id_tutor = ?`;
    let params = [
      nombre,
      fecha,
      normalizeEstado(estado),
      parseInt(id_encargado, 10),
      idSedeNum,
      parseInt(id_tutor, 10),
    ];

    if (archivoUrl && teraboxFsId) {
      query += `, archivo_url = ?, terabox_fs_id = ?`;
      params.push(archivoUrl, String(teraboxFsId));
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const result = await trx.execute({ sql: query, args: params });
    if (result.affectedRows === 0) {
      await trx.rollback();
      return res.status(404).json({ message: "Tesis no encontrada." });
    }

    // Actualizar Autores (Borrar e Insertar)
    await trx.execute({
      sql: "DELETE FROM Alumno_tesis WHERE id_tesis = ?",
      args: [id],
    });
    // Usamos la variable definida al principio
    for (const autorIdStr of idEstudiantesArray) {
      const autorId = parseInt(autorIdStr, 10);
      if (isNaN(autorId)) continue;
      await trx.execute({
        sql: "INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)",
        args: [autorId, id],
      });
    }

    // Actualizar Jurados (Borrar e Insertar)
    await trx.execute({
      sql: "DELETE FROM Jurado WHERE id_tesis = ?",
      args: [id],
    });
    
    for (const juradoIdStr of idJuradosArray) {
      const juradoId = parseInt(juradoIdStr, 10);
      if (isNaN(juradoId)) continue;
      await trx.execute({
        sql: "INSERT INTO Jurado (id_tesis, id_profesor) VALUES (?, ?)",
        args: [id, juradoId],
      });
    }

    await trx.commit();

    return res
      .status(200)
      .json({ message: "Tesis actualizada correctamente." });
  } catch (err) {
    await trx.rollback();
    next(err);
  }
};

// --- DESCARGAR TESIS ---
export const downloadTesis = async (req, res, next) => {
  const { id } = req.params;
  console.log("ID recibido:", id);

  try {
    const result = await db.execute({
      sql: "SELECT archivo_url, terabox_fs_id FROM Tesis WHERE id = ?",
      args: [id],
    });
    const row = result?.rows?.[0];
    if (!row) return res.status(404).json({ message: "Tesis no encontrada" });

    if (row.terabox_fs_id) {
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
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://www.terabox.com/",
          // 💡 SOLUCIÓN: La Cookie de autenticación fue restaurada aquí
          Cookie: `ndus=${process.env.TERABOX_NDUS}`,
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="tesis_${id}.pdf"`
      );
      response.data.pipe(res);

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

// --- Función para procesar la descarga en background ---
async function processDownloadAllTesis(jobId) {
  const progress = downloadProgress.get(jobId);
  if (!progress) return;

  try {
    progress.status = "processing";
    progress.current = 0;

    // 1. Obtener todas las tesis de la base de datos que tengan terabox_fs_id
    const result = await db.execute({
      sql: "SELECT id, nombre, terabox_fs_id, archivo_url FROM Tesis WHERE terabox_fs_id IS NOT NULL AND terabox_fs_id != ''",
    });

    const tesis = result.rows || [];
    progress.total = tesis.length;

    if (tesis.length === 0) {
      progress.status = "error";
      progress.error = "No se encontraron tesis con archivos en Terabox para descargar.";
      return;
    }

    // 2. Crear el archivo ZIP
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // 3. Descargar cada tesis
    for (let i = 0; i < tesis.length; i++) {
      const tesisItem = tesis[i];
      const { id, nombre, terabox_fs_id, archivo_url } = tesisItem;

      progress.current = i + 1;
      progress.progress = Math.round((progress.current / progress.total) * 100);
      progress.currentTesis = nombre;
      
      // Log periódico cada 10 tesis o en la última
      if (i % 10 === 0 || i === tesis.length - 1) {
        console.log(`[${jobId}] 📊 Progreso: ${progress.progress}% (${progress.current}/${progress.total}) - ${nombre}`);
      }

      try {
        console.log(
          `[${jobId}] Procesando tesis ${id}: ${nombre} (${progress.current}/${progress.total})`
        );

        // Obtener el enlace de descarga desde Terabox
        const linkData = await getDownloadLinkFromFsId(terabox_fs_id);
        const downloadLink =
          linkData?.downloadLink || linkData?.dlink || linkData?.url;

        if (!downloadLink) {
          console.warn(
            `[${jobId}] No se pudo obtener el enlace de descarga para la tesis ${id} (${nombre})`
          );
          // Intentar usar archivo_url como respaldo
          if (archivo_url) {
            console.log(`[${jobId}] Usando URL de respaldo para la tesis ${id}`);
            try {
              const response = await axios({
                method: "GET",
                url: archivo_url,
                responseType: "arraybuffer",
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                  Referer: "https://www.terabox.com/",
                  Cookie: `ndus=${process.env.TERABOX_NDUS}`,
                },
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
              });

              let fileData = response.data;
              if (!Buffer.isBuffer(fileData)) {
                fileData = Buffer.from(fileData);
              }

              if (!fileData || fileData.length === 0) {
                throw new Error("El archivo descargado está vacío");
              }

              const safeFileName = `${id}_${nombre.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
              )}.pdf`;
              zip.file(safeFileName, fileData);
              successCount++;
              progress.successCount = successCount;
              continue;
            } catch (backupError) {
              console.error(
                `[${jobId}] Error al descargar desde URL de respaldo para tesis ${id}:`,
                backupError.message
              );
              errorCount++;
              progress.errorCount = errorCount;
              errors.push({ id, nombre, error: backupError.message });
              zip.file(
                `error_log_${id}_${nombre.replace(
                  /[^a-zA-Z0-9._-]/g,
                  "_"
                )}.txt`,
                `No se pudo descargar esta tesis. Causa: No se pudo obtener enlace de Terabox ni usar URL de respaldo.`
              );
              continue;
            }
          } else {
            errorCount++;
            progress.errorCount = errorCount;
            errors.push({ id, nombre, error: "No se pudo obtener enlace de descarga" });
            zip.file(
              `error_log_${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, "_")}.txt`,
              `No se pudo descargar esta tesis. Causa: No se pudo obtener enlace de descarga.`
            );
            continue;
          }
        }

        // Descargar el archivo desde Terabox
        const response = await axios({
          method: "GET",
          url: downloadLink,
          responseType: "arraybuffer",
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Referer: "https://www.terabox.com/",
            Cookie: `ndus=${process.env.TERABOX_NDUS}`,
          },
          timeout: 60000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        let fileData = response.data;
        if (!Buffer.isBuffer(fileData)) {
          fileData = Buffer.from(fileData);
        }

        if (!fileData || fileData.length === 0) {
          throw new Error("El archivo descargado está vacío");
        }

        const safeFileName = `${id}_${nombre.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )}.pdf`;
        zip.file(safeFileName, fileData);
        successCount++;
        progress.successCount = successCount;
      } catch (error) {
        errorCount++;
        progress.errorCount = errorCount;
        errors.push({ id, nombre, error: error.message });
        console.error(
          `[${jobId}] Error procesando la tesis ${id} (${nombre}):`,
          error.message
        );
        zip.file(
          `error_log_${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, "_")}.txt`,
          `No se pudo descargar esta tesis. Causa: ${error.message}`
        );
      }
    }

    progress.currentTesis = null;
    progress.status = "generating";
    progress.errors = errors;

    // 4. Verificar si hay archivos en el ZIP
    const fileCount = Object.keys(zip.files).length;
    if (fileCount === 0) {
      progress.status = "error";
      progress.error = "No se pudieron descargar archivos. Verifique los logs de error.";
      return;
    }

    console.log(
      `[${jobId}] Proceso completado: ${successCount} exitosas, ${errorCount} con errores. Total archivos en ZIP: ${fileCount}`
    );

    // 5. Generar el ZIP completo en memoria
    console.log(`[${jobId}] Generando archivo ZIP...`);
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
      streamFiles: false,
    });

    if (!zipBuffer || zipBuffer.length === 0) {
      progress.status = "error";
      progress.error = "Error al generar el archivo ZIP. El archivo está vacío.";
      return;
    }

    const finalBuffer = Buffer.isBuffer(zipBuffer)
      ? zipBuffer
      : Buffer.from(zipBuffer);

    if (finalBuffer[0] !== 0x50 || finalBuffer[1] !== 0x4b) {
      progress.status = "error";
      progress.error = "Error al generar el archivo ZIP. El archivo generado no es válido.";
      return;
    }

    // Actualizar progreso a completado
    progress.status = "completed";
    progress.zipBuffer = finalBuffer;
    progress.progress = 100;
    progress.current = progress.total;
    progress.currentTesis = null;
    
    console.log(`[${jobId}] ✅ Status actualizado a COMPLETED`);
    console.log(`[${jobId}] ZIP generado correctamente: ${finalBuffer.length} bytes`);
    console.log(`[${jobId}] Progreso final: ${progress.progress}% (${progress.current}/${progress.total})`);
    console.log(`[${jobId}] Éxitos: ${progress.successCount}, Errores: ${progress.errorCount}`);
    
    // Pequeño delay para asegurar que el estado se propague
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar que el progreso se guardó correctamente
    const verifyProgress = downloadProgress.get(jobId);
    if (verifyProgress && verifyProgress.status === "completed") {
      console.log(`[${jobId}] ✅ Verificación: Status guardado correctamente como "completed"`);
      console.log(`[${jobId}] ✅ ZIP buffer disponible: ${verifyProgress.zipBuffer ? 'Sí' : 'No'}`);
    } else {
      console.error(`[${jobId}] ❌ ERROR: Status NO se guardó correctamente!`);
      console.error(`[${jobId}] Status actual en verificación: ${verifyProgress?.status || 'undefined'}`);
    }
  } catch (err) {
    console.error(`[${jobId}] ❌ Error en processDownloadAllTesis:`, err);
    console.error(`[${jobId}] Stack trace:`, err.stack);
    const progress = downloadProgress.get(jobId);
    if (progress) {
      progress.status = "error";
      progress.error = err.message;
      console.log(`[${jobId}] Status actualizado a ERROR: ${err.message}`);
    }
  }
}

// --- DESCARGAR TODAS LAS TESIS (Inicia proceso en background) ---
export const downloadAllTesis = async (req, res, next) => {
  try {
    console.log("=== ENDPOINT downloadAllTesis LLAMADO ===");
    
    // Crear un jobId único
    const jobId = randomUUID();
    
    // Inicializar el progreso
    downloadProgress.set(jobId, {
      status: "pending",
      progress: 0,
      total: 0,
      current: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      currentTesis: null,
      zipBuffer: null,
      createdAt: Date.now(),
    });

    // Iniciar el proceso en background (no esperar)
    processDownloadAllTesis(jobId).catch((err) => {
      console.error(`[${jobId}] Error no capturado:`, err);
    });

    // Devolver el jobId inmediatamente
    res.json({
      jobId,
      message: "Proceso de descarga iniciado. Usa el jobId para consultar el progreso.",
      progressUrl: `/tesis/download/progress/${jobId}`,
      streamUrl: `/tesis/download/progress/${jobId}/stream`,
    });
  } catch (err) {
    console.error("Error en downloadAllTesis:", err);
    next(err);
  }
};

// --- OBTENER PROGRESO DE DESCARGA (Polling) ---
export const getDownloadProgress = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    console.log(`[${jobId}] 📊 Consulta de progreso recibida`);
    
    const progress = downloadProgress.get(jobId);

    if (!progress) {
      console.log(`[${jobId}] ❌ Job no encontrado`);
      return res.status(404).json({
        error: "Job no encontrado. El jobId puede haber expirado o no existe.",
      });
    }

    console.log(`[${jobId}] 📊 Status actual: "${progress.status}", Progreso: ${progress.progress}%`);

    // Preparar respuesta sin el buffer (muy pesado)
    const response = {
      jobId,
      status: progress.status,
      progress: progress.progress,
      total: progress.total,
      current: progress.current,
      successCount: progress.successCount,
      errorCount: progress.errorCount,
      errors: progress.errors,
      currentTesis: progress.currentTesis,
      downloadUrl: progress.status === "completed" 
        ? `/tesis/download/result/${jobId}` 
        : null,
    };

    console.log(`[${jobId}] 📤 Enviando respuesta: status="${response.status}", downloadUrl=${response.downloadUrl ? 'presente' : 'null'}`);
    res.json(response);
  } catch (err) {
    console.error(`Error en getDownloadProgress:`, err);
    next(err);
  }
};

// --- STREAM DE PROGRESO DE DESCARGA (Server-Sent Events) ---
export const streamDownloadProgress = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    console.log(`[${jobId}] 📡 Conexión SSE iniciada`);
    
    const progress = downloadProgress.get(jobId);

    if (!progress) {
      console.log(`[${jobId}] ❌ Job no encontrado para SSE`);
      res.writeHead(404, { "Content-Type": "text/event-stream" });
      res.write(`data: ${JSON.stringify({ error: "Job no encontrado" })}\n\n`);
      res.end();
      return;
    }

    // Configurar headers para SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Deshabilitar buffering en nginx
    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS para SSE

    let isClosed = false;
    let lastStatus = null;
    let lastProgress = -1;
    let lastCurrent = -1;

    // Función para enviar actualización
    const sendUpdate = () => {
      if (isClosed || res.writableEnded || res.destroyed) {
        return false;
      }

      try {
        const currentProgress = downloadProgress.get(jobId);
        if (!currentProgress) {
          console.log(`[${jobId}] ❌ Job eliminado durante SSE`);
          res.write(`data: ${JSON.stringify({ error: "Job no encontrado" })}\n\n`);
          res.end();
          isClosed = true;
          return false;
        }

        // Enviar si el status cambió, el progreso cambió, o es la primera vez
        const statusChanged = lastStatus !== currentProgress.status;
        const progressChanged = lastProgress !== currentProgress.progress || lastCurrent !== currentProgress.current;
        const shouldSend = lastStatus === null || statusChanged || progressChanged;

        if (statusChanged) {
          console.log(`[${jobId}] 📡 SSE: Status cambió de "${lastStatus}" a "${currentProgress.status}"`);
          lastStatus = currentProgress.status;
        }
        
        if (progressChanged) {
          lastProgress = currentProgress.progress;
          lastCurrent = currentProgress.current;
        }

        // Si no hay cambios y no es la primera vez, no enviar (excepto si está completado)
        if (!shouldSend && currentProgress.status !== "completed" && currentProgress.status !== "error") {
          return true; // Continuar el intervalo pero no enviar datos
        }

        const data = {
          jobId,
          status: currentProgress.status,
          progress: currentProgress.progress,
          total: currentProgress.total,
          current: currentProgress.current,
          successCount: currentProgress.successCount,
          errorCount: currentProgress.errorCount,
          errors: currentProgress.errors,
          currentTesis: currentProgress.currentTesis,
          downloadUrl: currentProgress.status === "completed" 
            ? `/tesis/download/result/${jobId}` 
            : null,
        };

        res.write(`data: ${JSON.stringify(data)}\n\n`);
        
        // Forzar envío inmediato si está disponible
        if (typeof res.flush === 'function') {
          res.flush();
        }

        // Si está completado o con error, cerrar la conexión después de enviar
        if (currentProgress.status === "completed" || currentProgress.status === "error") {
          console.log(`[${jobId}] 📡 SSE: Status final detectado: "${currentProgress.status}"`);
          console.log(`[${jobId}] 📡 SSE: Enviando mensaje final con downloadUrl: ${data.downloadUrl || 'null'}`);
          
          // Enviar un mensaje adicional de confirmación antes de cerrar
          setTimeout(() => {
            if (!isClosed && !res.writableEnded && !res.destroyed) {
              // Enviar mensaje final de confirmación
              const finalData = {
                ...data,
                final: true,
                message: currentProgress.status === "completed" 
                  ? "Proceso completado. El archivo está listo para descargar."
                  : "Proceso finalizado con errores."
              };
              try {
                res.write(`data: ${JSON.stringify(finalData)}\n\n`);
                if (typeof res.flush === 'function') {
                  res.flush();
                }
              } catch (e) {
                console.error(`[${jobId}] Error enviando mensaje final SSE:`, e);
              }
              
              // Cerrar después de un pequeño delay
              setTimeout(() => {
                if (!isClosed && !res.writableEnded) {
                  res.end();
                  isClosed = true;
                  console.log(`[${jobId}] 📡 SSE: Conexión cerrada correctamente`);
                }
              }, 200);
            }
          }, 100);
          return false;
        }
        return true;
      } catch (err) {
        console.error(`[${jobId}] ❌ Error enviando actualización SSE:`, err);
        if (!isClosed && !res.writableEnded) {
          res.end();
          isClosed = true;
        }
        return false;
      }
    };

    // Enviar actualización inicial
    console.log(`[${jobId}] 📡 SSE: Enviando actualización inicial`);
    sendUpdate();

    // Enviar actualizaciones cada 500ms para mejor responsividad
    const interval = setInterval(() => {
      if (isClosed || res.writableEnded || res.destroyed) {
        clearInterval(interval);
        console.log(`[${jobId}] 📡 SSE: Intervalo detenido (conexión cerrada)`);
        return;
      }
      const shouldContinue = sendUpdate();
      if (!shouldContinue) {
        clearInterval(interval);
        console.log(`[${jobId}] 📡 SSE: Intervalo detenido (proceso completado)`);
      }
    }, 500); // Actualizar cada 500ms

    // Limpiar cuando el cliente cierra la conexión
    req.on("close", () => {
      console.log(`[${jobId}] 📡 SSE: Cliente cerró la conexión`);
      isClosed = true;
      clearInterval(interval);
      if (!res.writableEnded) {
        res.end();
      }
    });

    req.on("error", (err) => {
      console.error(`[${jobId}] ❌ Error en conexión SSE:`, err);
      isClosed = true;
      clearInterval(interval);
    });
  } catch (err) {
    console.error(`Error en streamDownloadProgress:`, err);
    next(err);
  }
};

// --- DESCARGAR RESULTADO DEL ZIP ---
export const downloadResult = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    console.log(`[${jobId}] 📥 Solicitud de descarga recibida`);
    
    const progress = downloadProgress.get(jobId);

    if (!progress) {
      console.log(`[${jobId}] ❌ Job no encontrado para descarga`);
      return res.status(404).json({
        error: "Job no encontrado. El jobId puede haber expirado o no existe.",
      });
    }

    console.log(`[${jobId}] 📥 Status del job: "${progress.status}"`);

    if (progress.status !== "completed") {
      console.log(`[${jobId}] ⏳ Proceso aún no completado. Status: "${progress.status}", Progreso: ${progress.progress}%`);
      return res.status(400).json({
        error: "El proceso aún no ha completado.",
        status: progress.status,
        progress: progress.progress,
      });
    }

    if (!progress.zipBuffer) {
      console.error(`[${jobId}] ❌ ZIP buffer no disponible aunque status es "completed"`);
      return res.status(500).json({
        error: "El archivo ZIP no está disponible.",
      });
    }

    console.log(`[${jobId}] ✅ Enviando ZIP de ${progress.zipBuffer.length} bytes`);

    // Configurar headers para la descarga
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="todas_las_tesis.zip"`
    );
    res.setHeader("Content-Length", progress.zipBuffer.length);
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Disposition, Content-Length"
    );

    // Enviar el buffer
    res.send(progress.zipBuffer);
    console.log(`[${jobId}] ✅ ZIP enviado correctamente`);

    // Opcional: Limpiar el buffer después de enviarlo (para ahorrar memoria)
    // downloadProgress.delete(jobId);
  } catch (err) {
    console.error(`[${jobId}] ❌ Error en downloadResult:`, err);
    next(err);
  }
};

// --- ELIMINAR TESIS ---
export const deleteTesis = async (req, res, next) => {
  const { id } = req.params;
  const trx = await db.transaction();

  try {
    // Borrar referencias de autores
    await trx.execute({
      sql: "DELETE FROM Alumno_tesis WHERE id_tesis = ?",
      args: [id],
    });

    // Borrar referencias de jurados
    await trx.execute({
      sql: "DELETE FROM Jurado WHERE id_tesis = ?",
      args: [id],
    });

    // Borrar la tesis principal
    const result = await trx.execute({
      sql: "DELETE FROM Tesis WHERE id = ?",
      args: [id],
    });

    if (result.affectedRows === 0) {
      await trx.rollback();
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    await trx.commit();
    return res.json({
      message: "Tesis eliminada correctamente (y sus asociaciones)",
    });
  } catch (err) {
    await trx.rollback();
    next(err);
  }
};

export const updateTesisStatus = async (req, res, next) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "El campo 'estado' es requerido." });
  }

  try {
    const result = await updateTesisStatusService(id, estado);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tesis no encontrada." });
    }
    res.status(200).json({ message: "Estado de la tesis actualizado correctamente." });
  } catch (error) {
    next(error);
  }
};