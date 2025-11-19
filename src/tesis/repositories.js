import db from "../../config/db.js";

export const updateTesisStatusInDb = async (id, estado) => {
  const query = "UPDATE Tesis SET estado = ? WHERE id = ?";
  const params = [estado, id];
  try {
    const result = await db.execute({ sql: query, args: params });
    return result;
  } catch (error) {
    console.error(`Error updating tesis status in DB: ${error.message}`);
    throw error;
  }
};
