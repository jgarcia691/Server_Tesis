import { EstudianteService } from './services.js';

export const getallEstudiantesControllers = async (req, res) => {
  try {
    const estudiantes = await EstudianteService.getAll();
    res.status(200).json(estudiantes);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Error al obtener estudiantes', error: error.message });
  }
};

export const getidControllers = async (req, res) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res.status(400).json({ message: 'El campo ci es obligatorio' });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res.status(400).json({ message: 'El campo ci debe ser un número válido' });
    }

    const estudiante = await EstudianteService.getByCi(ciNumber);
    res.status(200).json(estudiante);
  } catch (error) {
    console.error('Error en getidController:', error.message);
    res.status(500).json({ message: 'Error al obtener estudiante', error: error.message });
  }
};

export const createEstudianteControllers = async (req, res) => {
  try {
    const { ci, nombre, apellido, email, telefono, password } = req.body;

    if (!ci || !nombre || !apellido || !email || !telefono || !password) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios: ci, nombre, apellido, email, telefono, password',
      });
    }

    if (typeof ci !== 'number' ||typeof telefono !== 'number' ||typeof nombre !== 'string' ||typeof apellido !== 'string' ||typeof email !== 'string' ||typeof password !== 'string') {
      return res.status(400).json({
        message: 'ci y telefono deben ser números; nombre, apellido, email y password deben ser cadenas.',
      });
    }

    await EstudianteService.create({ ci, nombre, apellido, email, telefono, password });
    res.status(201).json({ message: 'Estudiante creado correctamente' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Error al crear estudiante', error: error.message });
  }
};

export const updateEstudianteControllers = async (req, res) => {
  try {
    const ci = Number(req.params.ci);
    const { nombre, apellido, email, telefono, password } = req.body;

    const telefonoNumber = Number(telefono);

    if (!ci || !nombre || !apellido || !email || !telefonoNumber || !password) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios: ci, nombre, apellido, email, telefono, password',
      });
    }

    if (isNaN(ci) ||isNaN(telefonoNumber) ||typeof nombre !== 'string' ||typeof apellido !== 'string' ||typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        message: 'ci y telefono deben ser números válidos; nombre, apellido, email y password deben ser cadenas.',
      });
    }

    await EstudianteService.update(ci, { nombre, apellido, email, telefono: telefonoNumber, password });
    res.status(200).json({ message: 'Estudiante actualizado correctamente' });
  } catch (error) {
    console.error('Error en updateEstudianteController:', error.message);
    res.status(500).json({ message: 'Error al actualizar estudiante', error: error.message });
  }
};

export const deleteEstudianteControllers = async (req, res) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res.status(400).json({ message: 'El campo ci es obligatorio' });
    }

    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res.status(400).json({ message: 'El campo ci debe ser un número válido' });
    }

    await EstudianteService.delete(ciNumber);
    res.status(200).json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Error al eliminar estudiante', error: error.message });
  }
};
