
import { AlumnoTesisService } from './services.js';

export const getAlumnoTesisController = async (req, res) => {
  try {
    const result = await AlumnoTesisService.getAll();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en GET Alumno_tesis:', error.message);
    res.status(500).json({ message: 'Error al obtener registros', error: error.message });
  }
};

export const getAlumnoTesisByIdController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'El id debe ser un número válido.' });
    }

    const result = await AlumnoTesisService.getById(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener registro por id:', error.message);
    res.status(500).json({ message: 'Error al obtener registro', error: error.message });
  }
};


export const postAlumnoTesisController = async (req, res) => {
  try {
    const {id_estudiante, id_tesis } = req.body;

    if (!id_estudiante || !id_tesis) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios:id_estudiante, id_tesis',
      });
    }

    if (typeof id_estudiante !== 'number' || typeof id_tesis !== 'number') {
      return res.status(400).json({
        message: 'Todos los campos deben ser números.',
      });
    }

    const result = await AlumnoTesisService.create({id_estudiante, id_tesis });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error en POST Alumno_tesis:', error.message);
    res.status(500).json({ message: 'Error al crear registro', error: error.message });
  }
};

export const deleteAlumnoTesisController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'El campo id es obligatorio y debe ser un número válido.' });
    }

    const result = await AlumnoTesisService.delete(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en DELETE Alumno_tesis:', error.message);
    res.status(500).json({ message: 'Error al eliminar registro', error: error.message });
  }
};
