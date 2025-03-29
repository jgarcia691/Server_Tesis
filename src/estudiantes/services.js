import {getEstudiantesRepository,createEstudianteRepository,updateEstudianteRepository,deleteEstudianteRepository,
  } from './repository.js';
  
  export const getEstudiantes = (req, res) => {
    getEstudiantesRepository((err, result) => {
      if (err) return res.status(500).json({ message: "Error en el servidor", error: err });
      return res.status(200).json(result);
    });
  };
  
  export const createEstudiante = (req, res) => {
    const { ci, nombre, apellido, telefono } = req.body;
    if (!ci || !nombre || !apellido || !telefono) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    createEstudianteRepository({ ci, nombre, apellido, telefono }, (err, result) => {
      if (err) return res.status(500).json({ message: "Error al insertar", error: err });
      return res.status(201).json({ message: "Estudiante creado correctamente" });
    });
  };
  
  export const updateEstudiante = (req, res) => {
    const { ci } = req.params;
    const { nombre, apellido, telefono } = req.body;
    if (!ci || !nombre || !apellido || !telefono) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    updateEstudianteRepository({ ci, nombre, apellido, telefono }, (err, result) => {
      if (err) return res.status(500).json({ message: "Error al actualizar", error: err });
      return res.status(200).json({ message: "Estudiante actualizado correctamente" });
    });
  };
  
  export const deleteEstudiante = (req, res) => {
    const { ci } = req.params;
    if (!ci) {
      return res.status(400).json({ message: "El campo 'ci' es obligatorio" });
    }
    deleteEstudianteRepository(ci, (err, result) => {
      if (err) return res.status(500).json({ message: "Error al eliminar", error: err });
      return res.status(200).json({ message: "Estudiante eliminado correctamente" });
    });
  };