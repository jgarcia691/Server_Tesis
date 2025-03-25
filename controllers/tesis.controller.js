import db from "../db.js";
import fs from "fs";

// Obtener todas las tesis
export const getTesis = (req, res) => {
    const sql = "SELECT id, nombre, fecha, estado FROM Tesis";
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

// Subir una nueva tesis con archivo PDF
export const uploadTesis = (req, res) => {
    const { id_encargado, id_sede, id_tutor, nombre, fecha, estado } = req.body;
    const archivo_pdf = fs.readFileSync(req.file.path); // Leer el archivo PDF

    const sql = "INSERT INTO Tesis (id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_pdf) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [id_encargado, id_sede, id_tutor, nombre, fecha, estado, archivo_pdf], (err, result) => {
        fs.unlinkSync(req.file.path); // Eliminar el archivo temporal
        if (err) return res.status(500).json({ message: "Error al subir la tesis", error: err });
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
