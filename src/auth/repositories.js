import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LoginRepository = {
  async findByEmail(email) {
    try {
      // This query now needs to check which table to join based on user_type
      // For simplicity, we'll first find the user in the Users table, then get details.
      const userResult = await db.execute(
        "SELECT * FROM Users WHERE user_ci IN (SELECT ci FROM Estudiante WHERE email = ? UNION SELECT ci FROM Profesor WHERE email = ? UNION SELECT ci FROM Encargado WHERE email = ?) LIMIT 1",
        [email, email, email]
      );

      const user = userResult.rows?.[0];
      if (!user) return null;

      let detailResult;
      if (user.user_type === 'estudiante') {
        detailResult = await db.execute("SELECT * FROM Estudiante WHERE ci = ? LIMIT 1", [user.user_ci]);
      } else if (user.user_type === 'profesor') {
        detailResult = await db.execute("SELECT * FROM Profesor WHERE ci = ? LIMIT 1", [user.user_ci]);
      } else if (user.user_type === 'encargado') {
        detailResult = await db.execute("SELECT * FROM Encargado WHERE ci = ? LIMIT 1", [user.user_ci]);
      }

      const userDetails = detailResult.rows?.[0];
      if (!userDetails) return null;

      // Combine user and userDetails
      return { ...user, ...userDetails };
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
