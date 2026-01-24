import { updateTesisStatusInDb } from "./repositories.js";

/**
 * Actualiza el estado de una tesis.
 * @param {number} id - El ID de la tesis.
 * @param {string} estado - El nuevo estado.
 * @returns {Promise<Object>} El resultado de la actualización.
 */
export const updateTesisStatus = async (id, estado) => {
  return await updateTesisStatusInDb(id, estado);
};
