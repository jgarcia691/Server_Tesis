import db from "../../db.js";

// Obtener todos los estudiantes
export const getEstudiantes = (req, res) => {
    const sql = "SELECT * FROM Estudiante";
    db.query(sql, (err, result) => {
        if (err) return res.json({ message: "Error en el servidor", error: err });
        return res.json(result);
    });
};

// Crear un nuevo estudiante
export const createEstudiante = (req, res) => {
    const { ci, nombre, apellido, telefono } = req.body;
    const sql = "INSERT INTO Estudiante (ci, nombre, apellido, telefono) VALUES (?, ?, ?, ?)";
    db.query(sql, [ci, nombre, apellido, telefono], (err, result) => {
        if (err) return res.json({ message: "Error al insertar", error: err });
        return res.json({ message: "Estudiante creado correctamente" });
    });
};

// Actualizar un estudiante
export const updateEstudiante = (req, res) => {
    const { ci } = req.params;
    const { nombre, apellido, telefono } = req.body;
    const sql = "UPDATE Estudiante SET nombre = ?, apellido = ?, telefono = ? WHERE ci = ?";
    db.query(sql, [nombre, apellido, telefono, ci], (err, result) => {
        if (err) return res.json({ message: "Error al actualizar", error: err });
        return res.json({ message: "Estudiante actualizado correctamente" });
    });
};

// Eliminar un estudiante
export const deleteEstudiante = (req, res) => {
    const { ci } = req.params;
    const sql = "DELETE FROM Estudiante WHERE ci = ?";
    db.query(sql, [ci], (err, result) => {
        if (err) return res.json({ message: "Error al eliminar", error: err });
        return res.json({ message: "Estudiante eliminado correctamente" });
    });
};

