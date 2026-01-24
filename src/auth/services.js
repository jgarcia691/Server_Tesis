import path from "path";
import { fileURLToPath } from "url";
import LoginRepository from "./repositories.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LoginService = {
  /**
   * Busca un usuario por email y contraseña.
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña en texto plano.
   * @returns {Promise<Object|null>} El usuario autenticado o null si falla.
   */
  async findByEmailAndPassword(email, password) {
    try {
      const user = await LoginRepository.findByEmail(email);

      if (!user) {
        console.log(
          "DEPURACIÓN: No se encontró ningún usuario con el correo:",
          email,
        );
        return null;
      }

      console.log("DEPURACIÓN: Comparando clave...");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("DEPURACIÓN: ❌ La contraseña no coincide");
        return null;
      }

      console.log("DEPURACIÓN: ✅ Contraseña válida");
      return user;
    } catch (error) {
      console.error(
        "DEPURACIÓN: 💥 Error en LoginService.findByEmailAndPassword:",
        error,
      );
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * @param {number} user_ci - Cédula de identidad (clave foránea).
   * @param {string} user_type - Tipo de usuario (estudiante, profesor, encargado).
   * @param {string} password - Contraseña en texto plano.
   * @returns {Promise<Object>} Resultado de la creación.
   * @throws {Error} Si el usuario ya existe.
   */
  async register(user_ci, user_type, password) {
    try {
      const existingUser = await LoginRepository.findByCi(user_ci);
      if (existingUser) {
        throw new Error("El usuario ya existe");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      return await LoginRepository.createUser(
        user_ci,
        user_type,
        hashedPassword,
      );
    } catch (error) {
      console.error("DEPURACIÓN: 💥 Error en LoginService.register:", error);
      throw error;
    }
  },
};

export default LoginService;
