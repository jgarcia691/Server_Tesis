import { UsuarioService } from './services.js';

export const getusuariocontroller = async (req, res) => {
  try {
    const usuarios = await UsuarioService.getAll();
    res.status(200).json(usuarios); 
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const postusuariocontroller = async (req, res) => {
  try {
    const { ci, nombre, apellido, telefono, password } = req.body;
    if (!ci || !nombre || !apellido || !telefono || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password" });
    }
    if (
      typeof ci !== 'number' || 
      typeof telefono !== 'number' || 
      typeof password !== 'number' || 
      typeof nombre !== 'string' || 
      typeof apellido !== 'string'
    ) {
      return res.status(400).json({ message: "ci, telefono y password deben ser números, nombre y apellido deben ser cadenas" });
    }
    await UsuarioService.create({ ci, nombre, apellido, telefono, password });
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al crear usuario", error: error.message });
  }
};

export const putusuariocontroller = async (req, res) => {
  try {
    const ci = Number(req.params.ci);
    const { nombre, apellido, telefono, password } = req.body;

    const telefonoNumber = Number(telefono);
    const passwordNumber = Number(password);

    if (!ci || !nombre || !apellido || !telefonoNumber || !passwordNumber) {
      return res.status(400).json({ message: "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password" });
    }
    if (
      isNaN(ci) || 
      isNaN(telefonoNumber) || 
      isNaN(passwordNumber) || 
      typeof nombre !== 'string' || 
      typeof apellido !== 'string'
    ) {
      return res.status(400).json({ message: "ci, telefono y password deben ser números válidos, nombre y apellido deben ser cadenas" });
    }
    await UsuarioService.update(ci, { nombre, apellido, telefono: telefonoNumber, password: passwordNumber });
    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error('Error en putusuariocontroller:', error);
    res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
  }
};

export const deleteusuariocontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    if (!ci) {
      return res.status(400).json({ message: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);
    if (isNaN(ciNumber)) {
      return res.status(400).json({ message: "El campo ci debe ser un número válido" });
    }

    await UsuarioService.delete(ciNumber);
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
  }
};