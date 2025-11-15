import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ProfesorService } from "./Services.js";

export const getallprofesorcontroller = async (req, res, next) => {
  try {
    const profesor = await ProfesorService.getAll();
    res.status(200).json(profesor);
  } catch (error) {
    next(error);
  }
};

export const getprofesorcontroller = async (req, res, next) => {
  try {
    const { ci } = req.params;
    const profesor = await ProfesorService.getProfesor(ci);
  
    if (!profesor || !profesor.data) {
        return res.status(404).json({ error: "Profesor no encontrado." });
    }
    
    res.status(200).json(profesor);
  } catch (error) {
    const errorMsg = (typeof error === 'string') ? error : (error.message || "");
    if (errorMsg.includes("no existe")) {
      return res.status(404).json({ error: errorMsg });
    }
    next(error);
  }
};

export const postprofesorcontroller = async (req, res, next) => {
  try {
    const { ci, ci_type, nombre, apellido, email, telefono, password } = req.body;
    
    if (!ci || !ci_type || !nombre || !apellido) {
      return res
        .status(400)
        .json({ error: "Los campos ci, ci_type, nombre y apellido son obligatorios." });
    }
    
    if (
      typeof ci !== "number" ||typeof ci_type !== "string" ||typeof telefono !== "string" ||typeof email !== "string" ||typeof nombre !== "string" ||typeof apellido !== "string" ||typeof password !== "string"
    ) {
      return res
        .status(400)
        .json({
          error:
            "ci debe ser un número; ci_type, nombre, apellido, email, telefono y password deben ser cadenas.",
        });
    }
    let existingProfesor = null;
    try {
      
      const result = await ProfesorService.getProfesor(ci);
      existingProfesor = result?.data; 
    } catch (findError) {
      
      const errorMsg = (typeof findError === 'string') ? findError : (findError.message || "");
      if (errorMsg.includes("no existe")) {
        existingProfesor = null; 
      } else {
        throw findError; 
      }
    }

    
    if (existingProfesor) {
      return res.status(409).json({ 
        error: "Ya existe un profesor registrado con esta cédula." 
      });
    }

    
    await ProfesorService.create({ ci, ci_type, nombre, apellido, email, telefono, password });
    
    
    res.status(201).json({ message: "Profesor creado correctamente" });

  } catch (error) {
    
    
    const errorMsg = (typeof error === 'string') ? error : (error.message || "");
    const errorCode = error.code || "";

    if (
        (errorCode === 'SQLITE_CONSTRAINT' || errorMsg.includes('SQLITE_CONSTRAINT')) && 
        errorMsg.includes('Persona.ci')
      ) {
      
      return res.status(409).json({ 
        error: "Esta cédula ya está registrada en el sistema (posiblemente como Estudiante o Encargado). No se puede crear como nuevo profesor.",
        code: "DUPLICATE_PERSONA_CI"
      });
    }
    
    
    next(error); 
  }
};

export const updateprofesorcontroller = async (req, res, next) => {
  try {
    const ci = Number(req.params.ci);
    const { ci_type, nombre, apellido, email, telefono } = req.body;

    if (!ci || !ci_type || !nombre || !apellido || !email || !telefono) {
      return res.status(400).json({
        error:
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, email, telefono",
      });
    }

    if (
      isNaN(ci) ||
      typeof ci_type !== "string" ||typeof telefono !== "string" ||typeof nombre !== "string" ||typeof apellido !== "string" ||typeof email !== "string"
    ) {
      return res.status(400).json({
        error:
          "ci debe ser un número válido; ci_type, nombre, apellido, email y telefono deben ser cadenas.",
      });
    }

    await ProfesorService.update(ci, {
      ci_type,nombre,apellido,email,telefono: telefono,
    });
    res.status(200).json({ message: "Profesor actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const deleteprofesorcontroller = async (req, res, next) => {
  try {
    const { ci } = req.params;
    if (!ci) {
      return res.status(400).json({ error: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);
    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ error: "El campo ci debe ser un número válido" });
    }

    await ProfesorService.delete(ciNumber);
    res.status(200).json({ message: "profesor eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};