// routes.js

import express from 'express';
import {
  getCarreraTesisController,
  postCarreraTesisController,
  deleteCarreraTesisController
} from './controllers.js';

const router = express.Router();

// Obtener todos los registros de Carrera_tesis
router.get('/', getCarreraTesisController);

// Crear un nuevo registro en Carrera_tesis
router.post('/', postCarreraTesisController);

// Eliminar un registro por ID
router.delete('/:id', deleteCarreraTesisController);

export default router;
