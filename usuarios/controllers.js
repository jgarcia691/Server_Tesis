import { UsuarioService } from '../services/usuario.service.js';

export const getusuariocontroller = async (req, res) => {
  try {
    const usuarios = await UsuarioService.getAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

export const postusuariocontroller = async (req, res) => {
  try {
    await UsuarioService.create(req.body);
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al insertar usuario", error });
  }
};

export const putusuariocontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    await UsuarioService.update(ci, req.body);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};

export const deleteusuariocontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    await UsuarioService.delete(ci);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};





