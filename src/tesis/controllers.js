import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";
import axios from "axios"; 
import https from "https";
import JSZip from "jszip";
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

// --- DESCARGAR TODAS LAS TESIS ---
export const downloadAllTesis = async (req, res, next) => {
  try {
    console.log("=== ENDPOINT downloadAllTesis LLAMADO ===");
    console.log("URL:", req.url);
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Iniciando la descarga de todas las tesis desde Terabox...");

    // 1. Obtener todas las tesis de la base de datos que tengan terabox_fs_id
    const result = await db.execute({
      sql: "SELECT id, nombre, terabox_fs_id, archivo_url FROM Tesis WHERE terabox_fs_id IS NOT NULL AND terabox_fs_id != ''",
    });

    const tesis = result.rows || [];
    console.log(`Se encontraron ${tesis.length} tesis con terabox_fs_id en la base de datos`);

    if (tesis.length === 0) {
      return res.status(404).json({ 
        message: "No se encontraron tesis con archivos en Terabox para descargar." 
      });
    }

    // 2. Crear el archivo ZIP
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    // 3. Descargar cada tesis
    for (const tesisItem of tesis) {
      const { id, nombre, terabox_fs_id, archivo_url } = tesisItem;
      
      try {
        console.log(`Procesando tesis ID ${id}: ${nombre} (fs_id: ${terabox_fs_id})`);
        
        // Obtener el enlace de descarga desde Terabox
        const linkData = await getDownloadLinkFromFsId(terabox_fs_id);
        const downloadLink = linkData?.downloadLink || linkData?.dlink || linkData?.url;

        if (!downloadLink) {
          console.warn(`No se pudo obtener el enlace de descarga para la tesis ${id} (${nombre})`);
          // Intentar usar archivo_url como respaldo
          if (archivo_url) {
            console.log(`Usando URL de respaldo para la tesis ${id}`);
            try {
              const response = await axios({
                method: "GET",
                url: archivo_url,
                responseType: "arraybuffer",
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                  "Referer": "https://www.terabox.com/",
                  "Cookie": `ndus=${process.env.TERABOX_NDUS}`,
                },
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
              });
              
              // Convertir a Buffer si no lo es ya
              let fileData = response.data;
              if (!Buffer.isBuffer(fileData)) {
                fileData = Buffer.from(fileData);
              }

              // Validar que el archivo tenga contenido
              if (!fileData || fileData.length === 0) {
                throw new Error("El archivo descargado está vacío");
              }
              
              // Limpiar el nombre del archivo para evitar caracteres problemáticos
              const safeFileName = `${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
              zip.file(safeFileName, fileData);
              successCount++;
              console.log(`✓ Tesis ${id} añadida al ZIP usando URL de respaldo (${fileData.length} bytes)`);
              continue;
            } catch (backupError) {
              console.error(`Error al descargar desde URL de respaldo para tesis ${id}:`, backupError.message);
              errorCount++;
              zip.file(`error_log_${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, '_')}.txt`, 
                `No se pudo descargar esta tesis. Causa: No se pudo obtener enlace de Terabox ni usar URL de respaldo.`);
              continue;
            }
          } else {
            errorCount++;
            zip.file(`error_log_${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, '_')}.txt`, 
              `No se pudo descargar esta tesis. Causa: No se pudo obtener enlace de descarga.`);
            continue;
          }
        }

        // Descargar el archivo desde Terabox
        console.log(`Descargando tesis ${id} desde: ${downloadLink.substring(0, 50)}...`);
        const response = await axios({
          method: "GET",
          url: downloadLink,
          responseType: "arraybuffer",
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.terabox.com/",
            "Cookie": `ndus=${process.env.TERABOX_NDUS}`,
          },
          timeout: 60000, // 60 segundos de timeout (aumentado para archivos grandes)
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        // Convertir a Buffer si no lo es ya
        let fileData = response.data;
        if (!Buffer.isBuffer(fileData)) {
          fileData = Buffer.from(fileData);
        }

        // Validar que el archivo tenga contenido
        if (!fileData || fileData.length === 0) {
          throw new Error("El archivo descargado está vacío");
        }

        // Limpiar el nombre del archivo para evitar caracteres problemáticos
        const safeFileName = `${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
        zip.file(safeFileName, fileData);
        successCount++;
        console.log(`✓ Tesis ${id} añadida al ZIP: ${safeFileName} (${fileData.length} bytes)`);

      } catch (error) {
        errorCount++;
        console.error(`Error procesando la tesis ${id} (${nombre}):`, error.message);
        zip.file(`error_log_${id}_${nombre.replace(/[^a-zA-Z0-9._-]/g, '_')}.txt`, 
          `No se pudo descargar esta tesis. Causa: ${error.message}`);
      }
    }

    // 4. Verificar si hay archivos en el ZIP
    const fileCount = Object.keys(zip.files).length;
    if (fileCount === 0) {
      return res.status(404).json({ 
        message: "No se pudieron descargar archivos. Verifique los logs de error." 
      });
    }

    console.log(`Proceso completado: ${successCount} exitosas, ${errorCount} con errores. Total archivos en ZIP: ${fileCount}`);

    // 5. Generar el ZIP completo en memoria y enviarlo
    console.log("Generando archivo ZIP...");
    console.log(`Archivos en ZIP antes de generar: ${Object.keys(zip.files).join(', ')}`);
    
    const zipBuffer = await zip.generateAsync({ 
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
      streamFiles: false // Asegurar que todos los archivos se procesen completamente
    });

    console.log(`ZIP generado: ${zipBuffer.length} bytes`);

    // Validar que el ZIP tenga contenido
    if (!zipBuffer || zipBuffer.length === 0) {
      return res.status(500).json({ 
        message: "Error al generar el archivo ZIP. El archivo está vacío." 
      });
    }

    // Asegurar que zipBuffer sea un Buffer
    const finalBuffer = Buffer.isBuffer(zipBuffer) ? zipBuffer : Buffer.from(zipBuffer);
    
    console.log(`Buffer final preparado: ${finalBuffer.length} bytes, tipo: ${Buffer.isBuffer(finalBuffer)}`);
    console.log(`Primeros 10 bytes del ZIP (magic number): ${Array.from(finalBuffer.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

    // Validar que el ZIP tenga el magic number correcto (PK = 50 4B)
    if (finalBuffer[0] !== 0x50 || finalBuffer[1] !== 0x4B) {
      console.error("ERROR: El buffer generado no parece ser un ZIP válido!");
      return res.status(500).json({ 
        message: "Error al generar el archivo ZIP. El archivo generado no es válido." 
      });
    }

    // Configurar headers para la descarga ANTES de enviar
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="todas_las_tesis.zip"`);
    res.setHeader("Content-Length", finalBuffer.length);
    // Headers CORS adicionales para asegurar la descarga
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Length");
    
    // Enviar el buffer completo
    res.send(finalBuffer);
    console.log("Archivo ZIP enviado correctamente.");

  } catch (err) {
    console.error("Error en la función downloadAllTesis:", err);
    // Si los headers ya se enviaron, no podemos enviar JSON
    if (res.headersSent) {
      console.error("Headers ya enviados, no se puede enviar mensaje de error");
      return;
    }
    // Enviar error como JSON solo si los headers no se han enviado
    return res.status(500).json({
      success: false,
      message: "Error al generar el archivo ZIP.",
      error: err.message,
    });
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