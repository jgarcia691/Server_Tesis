import express from 'express';
import { getjuradocontroller, postjuradocontroller, deletejuradocontroller } from './controller.js';

const router = express.Router();


// Define las rutas
router.get('/:id_tesis', getjuradocontroller);         
router.post('/', postjuradocontroller);             
router.delete('/', deletejuradocontroller);

export default router;
