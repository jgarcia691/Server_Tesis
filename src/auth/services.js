import path from "path";
import { fileURLToPath } from "url";
import LoginRepository from "./repositories.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LoginService = {
  async findByEmailAndPassword(email, password) {
    try {
      const user = await LoginRepository.findByEmail(email);

      if (!user) {
        console.log("No se encontró ningún usuario con el correo:", email);
        return null;
      }

      console.log("Comparando clave...");
      console.log("Hash guardado:", user.password);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ La contraseña no coincide");
        return null;
      }

      console.log("✅ Contraseña válida");
      return user;
    } catch (error) {
      console.error("💥 Error en LoginService.findByEmailAndPassword:", error);
      throw error;
    }
  },

  async register(user_ci, user_type, password) {
    try {
      const existingUser = await LoginRepository.findByCi(user_ci);
      if (existingUser) {
        throw new Error("El usuario ya existe");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      return await LoginRepository.createUser(user_ci, user_type, hashedPassword);
    } catch (error) {
      console.error("💥 Error en LoginService.register:", error);
      throw error;
    }
  }
};

export default LoginService;
