import { CarreraService } from "./services.js";

export const getcarreracontroller = async (req, res) => {
  try {
    const carreras = await CarreraService.getAll();
    res.status(200).json(carreras); 
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al obtener carreras", error: error.message });
  }
};


export const getcarreracodcontroller = async (req, res) => {
    try {
        const { cod } = req.params;
      const carreras = await CarreraService.getCarrera(cod);
      res.status(200).json(carreras); 
    } catch (error) {
      console.error('Error:', error); 
      res.status(500).json({ message: "Error al obtener carrera", error: error.message });
    }
};


export const postcarreracontroller = async (req, res) => {
  try {
    const { codigo, nombre, campo} = req.body;
    if (!codigo || !nombre || !campo) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    if (
      typeof codigo !== 'number' || 
      typeof nombre !== 'string' || 
      typeof campo !== 'string'
    ) {
      return res.status(400).json({ message: "codigo debe ser números, nombre y campo deben ser cadenas" });
    }
    await CarreraService.create({ codigo, nombre, campo });
    res.status(201).json({ message: "carrera creado correctamente" });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al crear carrera", error: error.message });
  }
};

export const deletecarreracontroller = async (req, res) => {
  try {
    const { codigo } = req.params;
    if (!codigo) {
      return res.status(400).json({ message: "El campo codigo es obligatorio" });
    }

    const codNumber = Number(codigo);
    if (isNaN(codNumber)) {
      return res.status(400).json({ message: "El campo cODIGO debe ser un número válido" });
    }

    await CarreraService.delete(codNumber);
    res.status(200).json({ message: "Carrera eliminado correctamente" });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al eliminar carrera", error: error.message });
  }
};
