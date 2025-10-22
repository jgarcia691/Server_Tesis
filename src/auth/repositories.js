import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LoginRepository = {
  async findByEmail(email) {
    try {
      // 1. Find the person by email to get their CI.
      const personaResult = await db.execute({
        sql: "SELECT ci FROM Persona WHERE email = ? LIMIT 1",
        args: [email],
      });

      const persona = personaResult.rows?.[0];
      if (!persona) return null;

      // 2. Find the user in the Users table using the CI.
      const userResult = await db.execute({
        sql: "SELECT * FROM Users WHERE user_ci = ? LIMIT 1",
        args: [persona.ci],
      });

      const user = userResult.rows?.[0];
      if (!user) return null;

      // 3. Fetch details from the corresponding role table.
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

      // 4. Combine user credentials and detailed personal info.
      return {
        ...user, // Contains id, user_ci, user_type, password
        ...userDetails, // Contains all fields from Persona and role-specific IDs
      };
    } catch (error) {
      console.error("Error en LoginRepository.findByEmail:", error);
      throw error;
    }
  },

  async createUser(user_ci, user_type, password) {
    try {
      const result = await db.execute(
        "INSERT INTO Users (user_ci, user_type, password) VALUES (?, ?, ?)",
        [user_ci, user_type, password]
      );
      return result;
    } catch (error) {
      console.error("Error en LoginRepository.createUser:", error);
      throw error;
    }
  },

  async findByCi(ci) {
    try {
      const result = await db.execute(
        "SELECT * FROM Users WHERE user_ci = ? LIMIT 1",
        [ci]
      );
      return result.rows?.[0];
    } catch (error) {
      console.error("Error en LoginRepository.findByCi:", error);
      throw error;
    }
  }
};

export default LoginRepository;
