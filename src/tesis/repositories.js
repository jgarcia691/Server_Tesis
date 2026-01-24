import db from "../../config/db.js";

/**
 * Actualiza el campo 'estado' de la tabla Tesis en la base de datos.
 * @param {number} id - ID de la tesis.
 * @param {string} estado - Nuevo valor para el estado.
 * @returns {Promise<Object>} Resultado de la ejecución SQL.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
export const updateTesisStatusInDb = async (id, estado) => {
  const query = "UPDATE Tesis SET estado = ? WHERE id = ?";
  const params = [estado, id];
  try {
    const result = await db.execute({ sql: query, args: params });
    return result;
  } catch (error) {
    console.error(
      `DEPURACIÓN: Error actualizando estado de tesis en BD: ${error.message}`,
    );
    throw error;
  }
};
