import db from '../../config/db.js';

export const getEstudiantesRepository = (callback) => {
  const sql = "SELECT * FROM Estudiante";
  db.query(sql, callback);
};

export const createEstudianteRepository = ({ ci, nombre, apellido, telefono }, callback) => {
  const sql = "INSERT INTO Estudiante (ci, nombre, apellido, telefono) VALUES (?, ?, ?, ?)";
  db.query(sql, [ci, nombre, apellido, telefono], callback);
};

export const updateEstudianteRepository = ({ ci, nombre, apellido, telefono }, callback) => {
  const sql = "UPDATE Estudiante SET nombre = ?, apellido = ?, telefono = ? WHERE ci = ?";
  db.query(sql, [nombre, apellido, telefono, ci], callback);
};

export const deleteEstudianteRepository = (ci, callback) => {
  const sql = "DELETE FROM Estudiante WHERE ci = ?";
  db.query(sql, [ci], callback);
};