// routes.js

import express from 'express';
import {
  getAlumnoTesisController,
  getAlumnoTesisByIdController,
  postAlumnoTesisController,
  deleteAlumnoTesisController
} from './controllers.js';

const router = express.Router();

// Obtener todos los registros de Alumno_tesis
router.get('/', getAlumnoTesisController);

// Obtener  registros de Alumno_tesis por su id
router.get('/:id', getAlumnoTesisByIdController);

// Crear un nuevo registro en Alumno_tesis
router.post('/', postAlumnoTesisController);

// Eliminar un registro de Alumno_tesis por ID
router.delete('/:id', deleteAlumnoTesisController);

export default router;
