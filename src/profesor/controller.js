import { ProfesorService } from "./Services.js";

export const getallprofesorcontroller = async (req, res) => {
  try {
    const profesor = await ProfesorService.getAll();
    res.status(200).json(profesor); 
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al obtener profesor", error: error.message });
  }
};

export const getprofesorcontroller= async (req,res) =>{
    try{
        const {ci} =  req.params;
        const profesor = await ProfesorService.getProfesor(ci);
        res.status(200).json(profesor);
    }catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error al obtener profesor", error: error.message });
    }
}

export const postprofesorcontroller = async (req, res) => {
  try {
    const { ci, nombre, apellido,email, telefono } = req.body;
    if (!ci || !nombre || !apellido || !email || !telefono) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    if (
      typeof ci !== 'number' || 
      typeof telefono !== 'string' || 
      typeof email !== 'string' || 
      typeof nombre !== 'string' || 
      typeof apellido !== 'string'
    ) {
      return res.status(400).json({ message: "ci, telefono deben ser números, nombre, email y apellido deben ser cadenas" });
    }
    await ProfesorService.create({ ci, nombre, apellido, email, telefono});
    res.status(201).json({ message: "Profesor creado correctamente" });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al crear profesor", error: error.message });
  }
};



export const deleteprofesorcontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    if (!ci) {
      return res.status(400).json({ message: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);
    if (isNaN(ciNumber)) {
      return res.status(400).json({ message: "El campo ci debe ser un número válido" });
    }

    await ProfesorService.delete(ciNumber);
    res.status(200).json({ message: "profesor eliminado correctamente" });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "profesor al eliminar usuario", error: error.message });
  }
};