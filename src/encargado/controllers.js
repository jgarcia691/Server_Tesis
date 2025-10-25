import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { EncargadoService } from "./services.js";

export const getallencargadocontroller = async (req, res) => {
  try {
    const encargados = await EncargadoService.getAll();
    res.status(200).json(encargados);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener encargados", error: error.message });
  }
};

export const getencargadocontroller = async (req, res) => {
  try {
    const { ci } = req.params;
    const ciNumber = Number(ci);

    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ message: "El CI debe ser un número válido." });
    }

    const encargado = await EncargadoService.getEncargado(ciNumber);
    res.status(200).json(encargado);
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ message: "Error al obtener encargado", error: error.message });
  }
};

export const postencargadocontroller = async (req, res) => {
  try {
    const {
      ci,
      ci_type,
      nombre,
      apellido,
      telefono,
      email,
      password,
      id_sede,
    } = req.body;

    if (
      !ci ||
      !ci_type ||
      !nombre ||
      !apellido ||
      !telefono ||
      !email ||
      !password ||
      !id_sede
    ) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios: ci, ci_type, nombre, apellido, telefono, email, password, id_sede",
      });
    }

    if (
      typeof ci !== "number" ||
      typeof ci_type !== "string" ||
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof telefono !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof id_sede !== "number"
    ) {
      return res.status(400).json({
        message:
          "Tipos de datos inválidos. Asegúrese de que ci e id_sede sean números y los demás campos sean cadenas.",
      });
    }
    await EncargadoService.create({
      ci,
      ci_type,
      nombre,
      apellido,
      telefono,
      email,
      password,
      id_sede,
    });
    res.status(201).json({ message: "Encargado creado correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al crear encargado", error: error.message });
  }
};

export const putencargadocontroller = async (req, res) => {
  try {
    const ci = Number(req.params.ci);
    const { nombre, apellido, telefono, email, id_sede } = req.body; // No se espera 'password' aquí

    if (!ci || !nombre || !apellido || !email || !telefono || !id_sede) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password, email",
      });
    }

    if (
      isNaN(ci) ||
      typeof telefono !== "string" || // 'telefono' es TEXT en DB, debe ser string
      typeof nombre !== "string" || // 'telefono' es TEXT en DB, debe ser string
      typeof apellido !== "string" || // Se eliminó 'password' de aquí
      typeof email !== "string" ||
      typeof id_sede !== "number"
    ) {
      return res.status(400).json({
        // Mensaje de error ajustado
        message:
          "ci y id_sede deben ser números válidos; nombre, apellido, telefono y email deben ser cadenas.",
      });
    }

    // ⚠️ La actualización de contraseña debe ser un endpoint separado.
    await EncargadoService.update(ci, {
      nombre,
      apellido,
      telefono,
      email,
      id_sede,
    });

    res.status(200).json({ message: "Encargado actualizado correctamente" });
  } catch (error) {
    console.error("Error en putencargadocontroller:", error.message);
    res
      .status(500)
      .json({ message: "Error al actualizar encargado", error: error.message });
  }
};

export const deletencargadocontroller = async (req, res) => {
  try {
    const { ci } = req.params;

    // La validación !ci es redundante si ci siempre viene de req.params
    if (isNaN(Number(ci))) {
      // Validar que ci sea un número antes de intentar convertirlo
      return res.status(400).json({ message: "El campo ci es obligatorio" });
    }

    const ciNumber = Number(ci);
    if (isNaN(ciNumber)) {
      return res
        .status(400)
        .json({ message: "El campo ci debe ser un número válido" });
    }

    await EncargadoService.delete(ciNumber);
    res.status(200).json({ message: "Encargado eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al eliminar encargado", error: error.message });
  }
};
