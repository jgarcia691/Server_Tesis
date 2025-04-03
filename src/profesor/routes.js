
import express from 'express';
import { getallprofesorcontroller, getprofesorcontroller, postprofesorcontroller, deleteprofesorcontroller } from "./controller.js";

const router = express.Router();

// Define las rutas
router.get('/', getallprofesorcontroller);
router.get('/:ci',getprofesorcontroller)         
router.post('/', postprofesorcontroller);             
router.delete('/:ci', deleteprofesorcontroller); 

export default router;
