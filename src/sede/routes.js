import express from 'express';
import { getsedecontroller, postsedecontroller, deletesedecontroller, getsedebyidcontroller } from './controllers.js';

const router = express.Router();


router.get('/:id', getsedebyidcontroller); 
router.get('/', getsedecontroller);       
router.post('/', postsedecontroller);    
router.delete('/:id', deletesedecontroller); 

export default router;
