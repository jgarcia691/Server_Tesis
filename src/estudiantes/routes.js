import express from 'express';
import { getAllEstudiantesController, createEstudianteController, updateEstudianteController, deleteEstudianteController } from './controller.js';

const router = express.Router();

router.get('/', getAllEstudiantesController);       
router.post('/', createEstudianteController);       
router.put('/:ci', updateEstudianteController);     
router.delete('/:ci', deleteEstudianteController);  

export default router;