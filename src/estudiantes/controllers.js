import { getEstudiantes,createEstudiante, updateEstudiante, deleteEstudiante, } from './services.js'; 
  
  
  export const getAllEstudiantesController = (req, res) => {
    getEstudiantes(req, res);
  };
  
  export const createEstudianteController = (req, res) => {
    createEstudiante(req, res);
  };

  
  export const updateEstudianteController = (req, res) => {
    updateEstudiante(req, res);
  };
  
  
  export const deleteEstudianteController = (req, res) => {
    deleteEstudiante(req, res);
  };