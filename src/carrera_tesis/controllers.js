// controller.js

import { CarreraTesisService } from './services.js';

export const getCarreraTesisController = async (req, res) => {
  try {
    const result = await CarreraTesisService.getAll();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en GET Carrera_tesis:', error.message);
    res.status(500).json({ message: 'Error al obtener registros', error: error.message });
  }
};

export const postCarreraTesisController = async (req, res) => {
  try {
    const { id, id_carrera, id_tesis } = req.body;

    if (!id || !id_carrera || !id_tesis) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios: id, id_carrera, id_tesis',
      });
    }

    if (typeof id !== 'number' || typeof id_carrera !== 'number' || typeof id_tesis !== 'number') {
      return res.status(400).json({
        message: 'Todos los campos deben ser números.',
      });
    }

    const result = await CarreraTesisService.create({ id, id_carrera, id_tesis });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error en POST Carrera_tesis:', error.message);
    res.status(500).json({ message: 'Error al crear registro', error: error.message });
  }
};

export const deleteCarreraTesisController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'El campo id es obligatorio y debe ser un número válido.' });
    }

    const result = await CarreraTesisService.delete(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en DELETE Carrera_tesis:', error.message);
    res.status(500).json({ message: 'Error al eliminar registro', error: error.message });
  }
};
