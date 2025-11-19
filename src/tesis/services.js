import { updateTesisStatusInDb } from "./repositories.js";

export const updateTesisStatus = async (id, estado) => {
  // TODO: Add any business logic here if needed
  return await updateTesisStatusInDb(id, estado);
};
