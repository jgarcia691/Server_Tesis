import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import LoginService from "./services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const postlogincontroller = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(" Intentando iniciar sesión con:", email);

    const user = await LoginService.findByEmailAndPassword(email, password);

    if (!user) {
      console.log(" Credenciales inválidas para:", email);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const payload = {
      id: user.id || user.ci,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "clave_secreta", {
      expiresIn: "1h",
    });

    console.log("✅ Login exitoso para:", email);

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        ci: user.ci,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(" Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const registerController = async (req, res) => {
  const { user_ci, user_type, password } = req.body;

  if (!user_ci || !user_type || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    await LoginService.register(user_ci, user_type, password);
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(" Error al registrar usuario:", error);
    if (error.message === "El usuario ya existe") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Error en el servidor" });
  }
};
