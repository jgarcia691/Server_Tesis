import { AlumnoCarreraService } from './services.js';

export const getAlumnoCarreraController = async (req, res) => {
    try {
        const result = await AlumnoCarreraService.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error en GET:', error.message);
        res.status(500).json({ message: 'Error al obtener registros', error: error.message });
    }
};

export const getAlumnoCarreraByCodigoController = async (req, res) => {
    try {
      const codigo = Number(req.params.codigo);
  
      if (!codigo || isNaN(codigo)) {
        return res.status(400).json({ message: 'El código debe ser un número válido.' });
      }
  
      const result = await AlumnoCarreraService.getByCodigo(codigo);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error en GET por código:', error.message);
      res.status(500).json({ message: 'Error al obtener registro', error: error.message });
    }
  };

export const postAlumnoCarreraController = async (req, res) => {
    try {
        const { codigo, id_estudiante, id_carrera } = req.body;

        if (
            typeof codigo !== 'number' ||
            typeof id_estudiante !== 'number' ||
            typeof id_carrera !== 'number'
        ) {
        return res.status(400).json({
            message: 'codigo, id_estudiante e id_carrera deben ser números',
        });
        }

        const result = await AlumnoCarreraService.create({ codigo, id_estudiante, id_carrera });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error en POST:', error.message);
        res.status(500).json({ message: 'Error al crear registro', error: error.message });
    }
};

export const deleteAlumnoCarreraController = async (req, res) => {
    try {
        const codigo = Number(req.params.codigo);
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'El código debe ser un número válido' });
        }

        const result = await AlumnoCarreraService.delete(codigo);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error en DELETE:', error.message);
        res.status(500).json({ message: 'Error al eliminar registro', error: error.message });
    }
};