import express from 'express';
import { getcarreracontroller, getcarreracodcontroller, postcarreracontroller, deletecarreracontroller } from './controller.js'; 

const router = express.Router();

// Define las rutas
router.get('/', getcarreracontroller);
router.get('/:cod',getcarreracodcontroller)         
router.post('/', postcarreracontroller);             
router.delete('/:cod', deletecarreracontroller); 

export default router;