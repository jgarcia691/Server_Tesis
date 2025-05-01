import db from '../../config/db.js';

import fs from "fs";

import { postAlumnoTesisController } from '../alumno_tesis/controllers.js'; 

export const getTesis = async (req, res) => {
    try {
        const result = await db.execute({
            sql: 'SELECT nombre, id_encargado, id_tutor, id_sede, fecha, estado FROM Tesis',
        });

        console.log("Resultado obtenido:", result);

        // Ahora debes enviar el resultado por res.json()
        res.json(result.rows);  // <- así responde correctamente al navegador
    } catch (err) {
        console.error('Error en getTesis:', err.message);
        res.status(500).json({ message: "Error en el servidor", error: err.message });
    }
};


// Obtener una tesis por ID (con PDF)
export const getTesisById = async (req, res) => {
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM Tesis',
        });

        console.log("Resultado obtenido:", result);

        // Ahora debes enviar el resultado por res.json()
        res.json(result.rows);  // <- así responde correctamente al navegador
    } catch (err) {
        console.error('Error en getTesisById:', err.message);
        res.status(500).json({ message: "Error en el servidor", error: err.message });
    }
};

// Obtener una tesis por nombre (con PDF)
export const getTesisByName = async (req, res) => {
    console.log(req.params);
    const { nombre } = req.params;
    const sql = "SELECT * FROM Tesis WHERE nombre LIKE ?";
    const searchTerm = `%${nombre}%`; // Añade los comodines %

    console.log(`Buscando término:`, searchTerm);

    try {
        const result = await db.execute(sql, [searchTerm]);  // Usando db.execute
        const rows = result.rows || result; // si db.execute devuelve { rows: [...] } o simplemente [...]

        if (rows.length === 0) {
            return res.status(404).json({ message: "Tesis no encontrada" });
        }

        res.json(rows); // Devuelve todo el array de resultados
    } catch (err) {
        console.error('Error al obtener tesis por nombre:', err.message);
        return res.status(500).json({ message: "Error en el servidor", error: err.message });
    }
};


// Subir una nueva tesis
export const uploadTesis = async (req, res) => {
    console.log("Archivo recibido:", req.file);
    console.log("Cuerpo recibido:", req.body);

    const { id_tesis, nombre, id_estudiante, id_tutor, id_encargado, fecha, id_sede, estado } = req.body;

    const idTesisInt = parseInt(id_tesis, 10);
    const idEstudianteInt = parseInt(id_estudiante, 10);

    // Validaciones básicas
    if (isNaN(idTesisInt)) {
        return res.status(400).json({ message: "El ID de la tesis debe ser un número entero válido." });
    }
    if (isNaN(idEstudianteInt)) {
        return res.status(400).json({ message: "El ID del estudiante debe ser un número entero válido." });
    }
    if (!req.file) {
        return res.status(400).json({ message: "El archivo PDF es obligatorio" });
    }

    // Leer el archivo PDF
    const archivo_pdf = fs.readFileSync(req.file.path);

    // Verificar si ya existe una tesis con ese id_tesis
    const checkSql = "SELECT id FROM Tesis WHERE id = ?";
    const checkResult = await db.execute(checkSql, [idTesisInt]);

    if (checkResult.rows.length > 0) {
        fs.unlinkSync(req.file.path); // Borra archivo temporal
        return res.status(400).json({ message: "Ya existe una tesis con ese ID." });
    }

    // Insertar la tesis
    const sqlTesis = `
        INSERT INTO Tesis (id, id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_pdf)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        await db.execute(sqlTesis, [idTesisInt, id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_pdf]);

        console.log("Tesis añadida con ID:", idTesisInt);

        // Asociar estudiante con tesis en alumno_tesis
        const fakeReq = {
            body: {
                id_estudiante: idEstudianteInt,
                id_tesis: idTesisInt,
            }
        };
        const fakeRes = {
            json: (response) => console.log("Respuesta de alumno_tesis:", response),
            status: (statusCode) => ({
                json: (response) => console.log(`Error ${statusCode}:`, response)
            })
        };

        await postAlumnoTesisController(fakeReq, fakeRes);

        // Eliminar archivo temporal
        fs.unlinkSync(req.file.path);

        // Responder éxito
        return res.json({ message: "Tesis subida correctamente y autor asociado", id_tesis: idTesisInt });

    } catch (error) {
        console.error("Error al subir la tesis o asociar el autor:", error);

        // Elimina archivo temporal en caso de error
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ message: "Error al subir la tesis o asociar el autor", error });
    }
};



export const downloadTesis = async (req, res) => {
    const { id } = req.params;
    console.log("ID recibido:", id);

    const sql = "SELECT archivo_pdf FROM Tesis WHERE id = ?";
    console.log("Consulta SQL:", sql);

    try {
        const result = await db.execute(sql, [id]);

        console.log("Resultado de la consulta:", result);

        if (!result || result.rows.length === 0 || !result.rows[0].archivo_pdf) {
            console.log("No se encontró el archivo PDF o no hay registros para este ID");
            return res.status(404).json({ message: "Tesis no encontrada o archivo PDF no disponible" });
        }

        // Convertir ArrayBuffer a Buffer
        const archivoPdfBuffer = Buffer.from(result.rows[0].archivo_pdf);
        console.log("Archivo PDF convertido a Buffer:", archivoPdfBuffer);

        if (archivoPdfBuffer.length === 0) {
            console.log("El archivo PDF está vacío");
            return res.status(404).json({ message: "Archivo PDF no encontrado" });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=tesis_${id}.pdf`);
        console.log("Cabeceras configuradas para la descarga");

        // Enviar el archivo PDF como un Buffer
        res.end(archivoPdfBuffer);
        console.log("Archivo PDF enviado correctamente");

    } catch (err) {
        console.error("Error al descargar el archivo PDF:", err.message);
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
        return res.status(500).json({ message: "Error al eliminar la tesis", error: err.message });
    }
};




// Actualizar una tesis
export const updateTesis = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha, estado } = req.body;

    // Verifica si el archivo está presente
    const archivoPdf = req.file ? fs.readFileSync(req.file.path) : null;

    // Construye la consulta SQL
    let query = `UPDATE Tesis SET nombre = ?, fecha = ?, estado = ?`;
    let params = [nombre, fecha, estado];

    if (archivoPdf) {
        query += `, archivo_pdf = ?`;
        params.push(archivoPdf);  // El archivo debe ser leído como buffer
    }

    query += ` WHERE id = ?`;
    params.push(id);

    try {
        console.log("Consulta SQL:", query);  // Verifica la consulta generada
        console.log("Parámetros:", params);  // Verifica los parámetros pasados

        // Ejecuta la consulta
        const result = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tesis no encontrada.' });
        }

        return res.status(200).json({ message: 'Tesis actualizada correctamente.' });

    } catch (err) {
        console.error("Error al actualizar la tesis:", err.message);
        return res.status(500).json({ message: 'Hubo un error al actualizar la tesis.', error: err.message });
    }
};
