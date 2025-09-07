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
    const encargado = await EncargadoService.getEncargado(ci);
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
    const { ci, nombre, apellido, telefono, password, email, id_sede } =
      req.body;

    if (
      !ci ||
      !nombre ||
      !apellido ||
      !telefono ||
      !password ||
      !email ||
      !id_sede
    ) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password, email, id_sede",
      });
    }

    if (
      typeof ci !== "number" ||
      typeof telefono !== "string" ||
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof id_sede !== "number"
    ) {
      return res.status(400).json({
        message:
          "ci, telefono y sede deben ser números; nombre, apellido, email y password deben ser cadenas.",
      });
    }

    // ⚠️ Ya no hacemos hash aquí
    await EncargadoService.create({
      ci,
      nombre,
      apellido,
      telefono,
      password,
      email,
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
    const { nombre, apellido, telefono, password, email, id_sede } = req.body;

    const telefonoNumber = Number(telefono);

    if (
      !ci ||
      !nombre ||
      !apellido ||
      !email ||
      !telefonoNumber ||
      !password ||
      !id_sede
    ) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios: ci, nombre, apellido, telefono, password, email",
      });
    }

    if (
      isNaN(ci) ||
      isNaN(telefonoNumber) ||
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof id_sede !== "number"
    ) {
      return res.status(400).json({
        message:
          "ci y telefono deben ser números válidos; nombre, apellido, email y password deben ser cadenas.",
      });
    }

    // ⚠️ No hasheamos aquí
    await EncargadoService.update(ci, {
      nombre,
      apellido,
      telefono: telefonoNumber,
      password,
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

    if (!ci) {
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
