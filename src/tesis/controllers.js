import db from '../../config/db.js';

import fs from "fs";

// Obtener todas las tesis
export const getTesis = (req, res) => {
    const sql = "SELECT nombre, id_encargado, id_tutor, id_sede, autor, fecha, estado FROM Tesis";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Error en el servidor", error: err });
        return res.json(result);
    });
};

// Obtener una tesis por ID (con PDF)
export const getTesisById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM Tesis WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error en el servidor", error: err });
        if (result.length === 0) return res.status(404).json({ message: "Tesis no encontrada" });

        const tesis = result[0];
        res.json(tesis);
    });
};


// Obtener una tesis por nombre (con PDF)
export const getTesisByName = (req, res) => {
    console.log(req.params);
    const { nombre } = req.params;
    const sql = "SELECT * FROM Tesis WHERE nombre LIKE ?";
    const searchTerm = `%${nombre}%`; // Añade los comodines %
    console.log(`Buscando término:`, searchTerm);
    db.query(sql, [searchTerm], (err, result) => {
        if (err) return res.status(500).json({ message: "Error en el servidor", error: err });
        if (result.length === 0) return res.status(404).json({ message: "Tesis no encontrada" });

        res.json(result); //Devuelve todo el array de results.
    });
};


export const uploadTesis = (req, res) => {
    console.log("Archivo recibido:", req.file); // Verifica que el archivo esté presente
    console.log("Cuerpo recibido:", req.body); // Verifica los datos adicionales que se reciben

    const { id_encargado, id_sede, id_tutor, nombre, fecha, estado } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "El archivo PDF es obligatorio" });
    }

    const archivo_pdf = fs.readFileSync(req.file.path);
    console.log("Archivo leído:", archivo_pdf); // Verifica que el archivo se haya leído correctamente

    const sql = "INSERT INTO Tesis (id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_pdf) VALUES (?, ?, ?, ?, ?, ?, ?)";
    console.log("Ejecutando consulta SQL:", sql); // Verifica la consulta
    db.query(sql, [id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_pdf], (err, result) => {
        if (err) {
            console.error("Error al insertar en la base de datos:", err);
            return res.status(500).json({ message: "Error al subir la tesis", error: err });
        }
        console.log("Tesis añadida correctamente:", result); // Verifica el resultado
        return res.json({ message: "Tesis subida correctamente" });
    });
};



// Descargar un PDF de una tesis
export const downloadTesis = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT archivo_pdf FROM Tesis WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error en el servidor", error: err });
        if (result.length === 0) return res.status(404).json({ message: "Tesis no encontrada" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=tesis_${id}.pdf`);
        res.send(result[0].archivo_pdf);
    });
};

// Eliminar una tesis
export const deleteTesis = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM Tesis WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al eliminar la tesis", error: err });
        return res.json({ message: "Tesis eliminada correctamente" });
    });
};



export const updateTesis = (req, res) => {
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

    console.log("Consulta SQL:", query);  // Verifica la consulta generada
    console.log("Parámetros:", params);  // Verifica los parámetros pasados

    // Ejecuta la consulta
    db.query(query, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Hubo un error al actualizar la tesis.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tesis no encontrada.' });
        }
        res.status(200).json({ message: 'Tesis actualizada correctamente.' });
    });
};
