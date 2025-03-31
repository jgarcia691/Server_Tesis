import express from 'express';
import {  getusuariocontroller, postusuariocontroller, putusuariocontroller, deleteusuariocontroller } from './controllers.js'; // Verifica que './controllers.js' esté correctamente ubicado

const router = express.Router();

// Define las rutas
router.get('/', getusuariocontroller);         
router.post('/', postusuariocontroller);        
router.put('/:ci', putusuariocontroller);       
router.delete('/:ci', deleteusuariocontroller); 

export default router;