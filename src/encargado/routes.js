import express from 'express';
import {  getencargadocontroller, postencargadocontroller,  putencargadocontroller, deletencargadocontroller } from './controllers.js'; 

const router = express.Router();


router.get('/username/:username', getencargadocontroller);         
router.post('/', postencargadocontroller);        
router.put('/:ci', putencargadocontroller);       
router.delete('/:ci', deletencargadocontroller); 

export default router;
