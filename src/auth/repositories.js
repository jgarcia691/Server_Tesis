import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LoginRepository = {
  /**
   * Busca un usuario por su correo electrónico, recuperando detalles según su rol.
   * @param {string} email - Correo electrónico a buscar.
   * @returns {Promise<Object|null>} El usuario con sus detalles o null.
   */
  async findByEmail(email) {
    try {
      // 1. Buscar a la persona por email para obtener su CI.
      const personaResult = await db.execute({
        sql: "SELECT ci FROM Persona WHERE email = ? LIMIT 1",
        args: [email],
      });

      const persona = personaResult.rows?.[0];
      if (!persona) return null;

      // 2. Buscar al usuario en la tabla Users usando el CI.
      const userResult = await db.execute({
        sql: "SELECT * FROM Users WHERE user_ci = ? LIMIT 1",
        args: [persona.ci],
      });

      const user = userResult.rows?.[0];
      if (!user) return null;

      // 3. Obtener detalles de la tabla de rol correspondiente.
      let detailResult;
      if (user.user_type === "estudiante") {
        detailResult = await db.execute({
          sql: "SELECT p.*, e.estudiante_ci FROM Persona p JOIN Estudiante e ON p.ci = e.estudiante_ci WHERE p.ci = ?",
          args: [user.user_ci],
        });
      } else if (user.user_type === "profesor") {
        detailResult = await db.execute({
          sql: "SELECT p.*, pr.profesor_ci FROM Persona p JOIN Profesor pr ON p.ci = pr.profesor_ci WHERE p.ci = ?",
          args: [user.user_ci],
        });
      } else if (user.user_type === "encargado") {
        detailResult = await db.execute({
          sql: "SELECT p.*, en.encargado_ci, en.id_sede FROM Persona p JOIN Encargado en ON p.ci = en.encargado_ci WHERE p.ci = ?",
          args: [user.user_ci],
        });
      }

      const userDetails = detailResult.rows?.[0];
      if (!userDetails) return null;

      // 4. Combinar credenciales de usuario e información personal detallada.
      return {
        ...user, // Contiene id, user_ci, user_type, password
        ...userDetails, // Contiene campos de Persona e IDs específicos del rol
      };
    } catch (error) {
      console.error("DEPURACIÓN: Error en LoginRepository.findByEmail:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo usuario en la tabla Users.
   * @param {number} user_ci - CI del usuario.
   * @param {string} user_type - Rol del usuario.
   * @param {string} password - Contraseña hasheada.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  async createUser(user_ci, user_type, password) {
    try {
      const result = await db.execute(
        "INSERT INTO Users (user_ci, user_type, password) VALUES (?, ?, ?)",
        [user_ci, user_type, password],
      );
      return result;
    } catch (error) {
      console.error("DEPURACIÓN: Error en LoginRepository.createUser:", error);
      throw error;
    }
  },

  /**
   * Busca un usuario por su CI.
   * @param {number} ci - Cédula de identidad.
   * @returns {Promise<Object|null>} El usuario encontrado o null.
   */
  async findByCi(ci) {
    try {
      const result = await db.execute(
        "SELECT * FROM Users WHERE user_ci = ? LIMIT 1",
        [ci],
      );
      return result.rows?.[0];
    } catch (error) {
      console.error("DEPURACIÓN: Error en LoginRepository.findByCi:", error);
      throw error;
    }
  },
};

export default LoginRepository;
