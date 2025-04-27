import { SedeService } from './services.js';

export const getsedecontroller = async (req, res) => {
    try {
        const sedes = await SedeService.getAll();
        res.status(200).json(sedes);
    } catch (error) {
        console.error('Error en getsedecontroller:', error.message);
        res.status(500).json({ message: 'Error al obtener las sedes', error: error.message });
    }
};

export const getsedebyidcontroller = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "El campo id es obligatorio para buscar una sede" });
        }

        const idNumber = Number(id);

        if (isNaN(idNumber)) {
            return res.status(400).json({ message: "El campo id debe ser un número válido" });
        }

        const sede = await SedeService.getById(idNumber);
        res.status(200).json(sede);
    } catch (error) {
        console.error('Error en getsedebyidcontroller:', error.message);
        res.status(500).json({ message: 'Error al obtener la sede', error: error.message });
    }
};

export const postsedecontroller = async (req, res) => {
    try {
        const { id, nombre, Direccion, telefono } = req.body;

        if (!id || !nombre || !Direccion || !telefono) {
            return res.status(400).json({ message: "Todos los campos son obligatorios: id, nombre, Direccion, telefono" });
        }

        const idNumber = Number(id);
        if (isNaN(idNumber) || typeof telefono !== 'string' || typeof nombre !== 'string' || typeof Direccion !== 'string') {
            return res.status(400).json({
                message: "id y telefono deben ser números; nombre y Direccion deben ser cadenas."
            });
        }

        await SedeService.create({ id: idNumber, nombre, Direccion, telefono });
        res.status(201).json({ message: "Sede creada correctamente" });
    } catch (error) {
        console.error('Error en postsedecontroller:', error.message);
        res.status(500).json({ message: 'Error al crear la sede', error: error.message });
    }
};

export const deletesedecontroller = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "El campo id es obligatorio para eliminar una sede" });
        }

        const idNumber = Number(id);

        if (isNaN(idNumber)) {
            return res.status(400).json({ message: "El campo id debe ser un número válido" });
        }

        await SedeService.delete(idNumber);
        res.status(200).json({ message: "Sede eliminada correctamente" });
    } catch (error) {
        console.error('Error en deletesedecontroller:', error.message);
        res.status(500).json({ message: 'Error al eliminar la sede', error: error.message });
    }
};
