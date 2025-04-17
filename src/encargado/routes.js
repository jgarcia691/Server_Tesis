import express from 'express';
import { getallencargadocontroller, getencargadocontroller, postencargadocontroller, putencargadocontroller, deletencargadocontroller } from './controllers.js';

const router = express.Router();


router.get('/', getallencargadocontroller);
router.get('/:ci', getencargadocontroller)
router.post('/', postencargadocontroller);
router.put('/:ci', putencargadocontroller);
router.delete('/:ci', deletencargadocontroller);

export default router;
