import express from 'express';
import { getallEstudiantesControllers, createEstudianteControllers, updateEstudianteControllers, deleteEstudianteControllers,getidControllers } from './controllers.js';

const router = express.Router();

//router.get('/username/:username', getallEstudiantesControllers); 
router.get('/', getallEstudiantesControllers); 
router.get('/ci/:ci', getidControllers); 
router.post('/', createEstudianteControllers);       
router.put('/:ci', updateEstudianteControllers);     
router.delete('/:ci', deleteEstudianteControllers);  

export default router;
