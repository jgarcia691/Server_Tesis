import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";
import axios from "axios"; 
import https from "https"; 
import {
  uploadBufferToTerabox,
  getDownloadLinkFromFsId,
} from "../../config/terabox.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Función Auxiliar para Normalizar Estado ---
const normalizeEstado = (estadoBruto) => {
  if (!estadoBruto) return 'pendiente';
  const estadoLimpio = estadoBruto.toLowerCase().trim();
  if (estadoLimpio.includes('en revision')) return 'en revisión';
  if (estadoLimpio.includes('aprobada')) return 'aprobado';
  if (estadoLimpio.includes('rechazada')) return 'rechazado';
  if (['aprobado', 'rechazado', 'pendiente', 'en revisión'].includes(estadoLimpio)) {
    return estadoLimpio;
  }
  return 'pendiente';
};

// --- Función Auxiliar para asegurar que los IDs sean un Array ---
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return [data]; 
  return [];
};

// --- OBTENER TODAS LAS TESIS (CON AUTORES Y JURADOS) ---
export const getTesis = async (req, res, next) => {
  try {
    const result = await db.execute({
      sql: `
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
        GROUP BY t.id
      `,
    });

    const tesisConAutores = result.rows.map((tesis) => ({
      ...tesis,
      autores: JSON.parse(tesis.autores || "[]"),
      jurados: JSON.parse(tesis.jurados || "[]"),
    }));

    console.log("Resultado obtenido:", tesisConAutores.length);
    res.json(tesisConAutores);
  } catch (err) {
    next(err);
  }
};

// --- OBTENER TESIS POR ID (CON AUTORES Y JURADOS) ---
export const getTesisById = async (req, res, next) => {
  const { id } = req.params;
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

// --- OBTENER TESIS POR NOMBRE (BÚSQUEDA) ---
export const getTesisByName = async (req, res, next) => {
  const { nombre } = req.params;
  const sql = `
    SELECT
      t.id, t.nombre, t.id_encargado, t.id_tutor, t.id_sede, t.fecha, t.estado,
      JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
        'ci', p_aut.ci, 'nombre', p_aut.nombre, 'apellido', p_aut.apellido
      )) FILTER (WHERE p_aut.ci IS NOT NULL) as autores,
      JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT(
        'ci', p_jur.ci, 'nombre', p_jur.nombre, 'apellido', p_jur.apellido
      )) FILTER (WHERE p_jur.ci IS NOT NULL) as jurados
    FROM Tesis t
    LEFT JOIN Alumno_tesis at ON t.id = at.id_tesis
    LEFT JOIN Estudiante e ON at.id_estudiante = e.estudiante_ci
    LEFT JOIN Persona p_aut ON e.estudiante_ci = p_aut.ci
    LEFT JOIN Jurado tj ON t.id = tj.id_tesis 
    LEFT JOIN Profesor pr ON tj.id_profesor = pr.profesor_ci 
    LEFT JOIN Persona p_jur ON pr.profesor_ci = p_jur.ci
    WHERE t.nombre LIKE ?
    GROUP BY t.id
  `;
  const searchTerm = `%${nombre}%`; 

  try {
    const result = await db.execute({ sql: sql, args: [searchTerm] });
    const rows = result.rows || [];

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tesis no encontrada" });
    }

    const tesisConAutores = rows.map((tesis) => ({
      ...tesis,
      autores: JSON.parse(tesis.autores || "[]"),
      jurados: JSON.parse(tesis.jurados || "[]"),
    }));

    res.json(tesisConAutores);
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
    id_estudiantes, // Array de autores
    id_jurados,     // Array de jurados
  } = req.body;

  if (!id_sede) {
    return next(new Error("El campo id_sede es obligatorio."));
  }
  const idSedeNum = parseInt(id_sede, 10);
  if (isNaN(idSedeNum)) {
    return next(new Error("El campo id_sede debe ser un número."));
  }
  
  if (!req.file || !req.file.buffer) {
    return next(new Error("El archivo PDF es obligatorio"));
  }
  
  const trx = await db.transaction(); 
  
  try {
    const archivo_pdf = Buffer.from(req.file.buffer);
    console.log(`DEBUG: Buffer de archivo PDF creado con tamaño: ${archivo_pdf.length}`);

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
      console.log(`DEBUG: Terabox - fs_id: ${teraboxFsId}, dlink: ${archivoUrl}`);
    } catch (e) {
      throw new Error(`Error subiendo a Terabox: ${e.message}`);
    }

    const sqlTesis = `
        INSERT INTO Tesis (id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_url, terabox_fs_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      parseInt(id_encargado, 10),
      idSedeNum,
      parseInt(id_tutor, 10),
      nombre,
      fecha,
      normalizeEstado(estado),
      archivoUrl,
      teraboxFsId ? String(teraboxFsId) : null,
    ];

    const result = await trx.execute({ sql: sqlTesis, args: params });
    const newTesisId = Number(result.lastInsertRowid);
    console.log(`DEBUG: Tesis añadida con ID: ${newTesisId}`);

    // Insertar Autores (Estudiantes)
    for (const autorIdStr of idEstudiantesArray) {
      const autorId = parseInt(autorIdStr, 10);
      if (isNaN(autorId)) continue;
      await trx.execute({
        sql: "INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)",
        args: [autorId, newTesisId]
      });
    }

    // Insertar Jurados (Profesores)
    const idJuradosArray = ensureArray(id_jurados);
    for (const juradoIdStr of idJuradosArray) {
      const juradoId = parseInt(juradoIdStr, 10);
      if (isNaN(juradoId)) continue;
      await trx.execute({
        sql: "INSERT INTO Jurado (id_tesis, id_profesor) VALUES (?, ?)", 
        args: [newTesisId, juradoId]
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
    id_estudiantes, // Array de autores
    id_jurados,     // Array de jurados
  } = req.body;

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
        console.log(`DEBUG: Nuevo Terabox - fs_id: ${teraboxFsId}, dlink: ${archivoUrl}`);
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
    await trx.execute({ sql: "DELETE FROM Alumno_tesis WHERE id_tesis = ?", args: [id] });
    for (const autorIdStr of idEstudiantesArray) {
      const autorId = parseInt(autorIdStr, 10);
      if (isNaN(autorId)) continue;
      await trx.execute({
        sql: "INSERT INTO Alumno_tesis (id_estudiante, id_tesis) VALUES (?, ?)",
        args: [autorId, id]
      });
    }

    // Actualizar Jurados (Borrar e Insertar)
    await trx.execute({ sql: "DELETE FROM Jurado WHERE id_tesis = ?", args: [id] }); 
    const idJuradosArray = ensureArray(id_jurados);
    for (const juradoIdStr of idJuradosArray) {
      const juradoId = parseInt(juradoIdStr, 10);
      if (isNaN(juradoId)) continue;
      await trx.execute({
        sql: "INSERT INTO Jurado (id_tesis, id_profesor) VALUES (?, ?)", 
        args: [id, juradoId]
      });
    }

    await trx.commit(); 
    
    return res.status(200).json({ message: "Tesis actualizada correctamente." });
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
      args: [id]
    });
    const row = result?.rows?.[0];
    if (!row) return res.status(404).json({ message: "Tesis no encontrada" });

    if (row.terabox_fs_id) {
      console.log("Obteniendo enlace de descarga...");
      const link = await getDownloadLinkFromFsId(row.terabox_fs_id);
      const fileLink = link?.downloadLink;

      if (!fileLink) {
        if (row.archivo_url) {
          console.log("No se pudo obtener el enlace de Terabox, usando URL de respaldo.");
          return res.redirect(row.archivo_url);
        }
        throw new Error("No se pudo obtener el enlace de descarga y no hay URL de respaldo.");
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
          "Referer": "https://www.terabox.com/",
          // 💡 SOLUCIÓN: La Cookie de autenticación fue restaurada aquí
          "Cookie": `ndus=${process.env.TERABOX_NDUS}`, 
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

// --- ELIMINAR TESIS ---
export const deleteTesis = async (req, res, next) => {
  const { id } = req.params;
  const trx = await db.transaction(); 
  
  try {
    // Borrar referencias de autores
    await trx.execute({
      sql: "DELETE FROM Alumno_tesis WHERE id_tesis = ?",
      args: [id]
    });
    
    // Borrar referencias de jurados
    await trx.execute({
      sql: "DELETE FROM Jurado WHERE id_tesis = ?", 
      args: [id]
    });

    // Borrar la tesis principal
    const result = await trx.execute({
      sql: "DELETE FROM Tesis WHERE id = ?",
      args: [id]
    });

    if (result.affectedRows === 0) {
      await trx.rollback();
      return res.status(404).json({ message: "Tesis no encontrada" });
    }
    
    await trx.commit();
    return res.json({ message: "Tesis eliminada correctamente (y sus asociaciones)" });
    
  } catch (err) {
    await trx.rollback();
    next(err);
  }
};