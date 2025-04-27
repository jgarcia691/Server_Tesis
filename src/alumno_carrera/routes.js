import express from 'express';
import {
  getAlumnoCarreraController,
  getAlumnoCarreraByCodigoController,
  postAlumnoCarreraController,
  deleteAlumnoCarreraController,
} from './controllers.js';

const router = express.Router();

// Obtener todos los registros de Alumno_carrera
router.get('/', getAlumnoCarreraController);

// Obtener registro de Alumno_carrera por su codigo
router.get('/:codigo', getAlumnoCarreraByCodigoController);

// Crear un nuevo registro de Alumno_carrera
router.post('/', postAlumnoCarreraController);

// Eliminar un registro de Alumno_carrera por código
router.delete('/:codigo', deleteAlumnoCarreraController);

export default router;
