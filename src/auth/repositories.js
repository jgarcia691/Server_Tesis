import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LoginRepository = {
  async findByEmail(email) {
    try {
      const result = await db.execute(
        "SELECT * FROM Encargado WHERE email = ? LIMIT 1",
        [email],
      );

      const rows = result.rows || [];

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en LoginRepository.findByEmail:", error);
      throw error;
    }
  },
};

export default LoginRepository;
