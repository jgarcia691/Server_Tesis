import express from 'express';
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from '../controllers/estudiante.controller.js';

const router = express.Router();

router.get('/', getEstudiantes);
router.post('/', createEstudiante);
router.put('/:ci', updateEstudiante);
router.delete('/:ci', deleteEstudiante);

export default router;
