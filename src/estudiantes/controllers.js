import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EstudianteService } from "./services.js";

export const getallEstudiantesControllers = async (req, res, next) => {
  try {
    const estudiantes = await EstudianteService.getAll();
    res.status(200).json(estudiantes);
  } catch (error) {
    next(error);
  }
};

export const getidControllers = async (req, res, next) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res.status(400).json({ error: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res.status(400).json({ error: "El campo ci debe ser un número válido" });
    }

    const estudiante = await EstudianteService.getByCi(ciNumber);
    
    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    
    res.status(200).json(estudiante);
  } catch (error) {
    const errorMsg = (typeof error === 'string') ? error : (error.message || "");
    if (errorMsg.includes("no existe")) {
      return res.status(404).json({ error: errorMsg });
    }
    next(error);
  }
};

export const createEstudianteControllers = async (req, res, next) => {
  try {
    const { ci, ci_type, nombre, apellido, email, telefono, password } =
      req.body;

    if (
      !ci ||!ci_type ||!nombre ||!apellido
    ) {
      return res.status(400).json({ 
        error: "Los siguientes campos son obligatorios: ci, ci_type, nombre, apellido" 
      });
    }

    if (
      typeof ci !== "number" ||typeof ci_type !== "string" ||typeof telefono !== "string" ||typeof nombre !== "string" ||typeof apellido !== "string" ||typeof email !== "string" ||typeof password !== "string"
    ) {
      return res.status(400).json({ 
        error: "ci debe ser número; ci_type, telefono, nombre, apellido, email y password deben ser cadenas." 
      });
    }
    
   

    let existingEstudiante = null;
    try {
      existingEstudiante = await EstudianteService.getByCi(ci);
    } catch (findError) {
      const errorMsg = (typeof findError === 'string') ? findError : (findError.message || "");

      if (errorMsg.includes("no existe")) {
        existingEstudiante = null; 
      } else {
        
        throw findError;
      }
    }

    
    if (existingEstudiante) {
      
      return res.status(409).json({ 
        error: "Ya existe un estudiante registrado con esta cédula." 
      });
    }

    
    await EstudianteService.create({
      ci,ci_type,nombre,apellido,email,telefono,password,
    });
    
    res.status(201).json({ message: "Estudiante creado correctamente" });

  } catch (error) {
    
    const errorMsg = (typeof error === 'string') ? error : (error.message || "");
    const errorCode = error.code || "";

    if (
        (errorCode === 'SQLITE_CONSTRAINT' || errorMsg.includes('SQLITE_CONSTRAINT')) && 
        errorMsg.includes('Persona.ci')
      ) {
      return res.status(409).json({ 
        error: "Esta cédula ya está registrada en el sistema (posiblemente como Profesor o Encargado). No se puede crear como nuevo estudiante.",
        code: "DUPLICATE_PERSONA_CI"
      });
    }
    
    next(error); 
  }
};

export const updateEstudianteControllers = async (req, res, next) => {
  try {
    const ci = Number(req.params.ci);
    const { ci_type, nombre, apellido, email, telefono } = req.body;

    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono) {
      return res.status(400).json({ 
        error: "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, email, telefono" 
      });
    }

    if (
      isNaN(ci) ||
     typeof ci_type !== "string" ||typeof telefono !== "string" || typeof nombre !== "string" ||typeof apellido !== "string" ||typeof email !== "string"
    ) {
      return res.status(400).json({ 
        error: "ci debe ser un número válido; ci_type, nombre, apellido, email y telefono deben ser cadenas." 
      });
    }

    await EstudianteService.update(ci, {
      ci_type,nombre,apellido,email,telefono: telefono,
    });
    res.status(200).json({ message: "Estudiante actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const deleteEstudianteControllers = async (req, res, next) => {
  try {
    const { ci } = req.params;

    if (isNaN(Number(ci))) {
      return res.status(400).json({ error: "El campo ci debe ser un número válido" });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res.status(400).json({ error: "El campo ci debe ser un número válido" });
    }

    await EstudianteService.delete(ciNumber);
    res.status(200).json({ message: "Estudiante eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};