import db from "../../config/db.js";

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
