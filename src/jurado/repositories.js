import db from "../../config/db.js";

export class JuradoRepository {

  static async getJurado(id_tesis) {
    try {
      console.log('Buscando jurado para tesis:', id_tesis);
      const result = await db.execute({
        sql: "SELECT * FROM jurado WHERE id_tesis = ?",
        args: [id_tesis],
      });
      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      console.error('Error en JuradoRepository.getJurado:', err.message);
      throw err;
    }
  }

  static async create({ id_tesis, id_profesor }) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO jurado (id_tesis, id_profesor) VALUES (?, ?)",
        args: [id_tesis, id_profesor],
      });
      return result;
    } catch (err) {
      console.error('Error en JuradoRepository.create:', err.message);
      throw err;
    }
  }

  static async delete(id_tesis, id_profesor) {
    try {
      console.log("Eliminando jurado con:", { id_tesis, id_profesor });
      const result = await db.execute({
        sql: "DELETE FROM jurado WHERE id_tesis = ? AND id_profesor = ?",
        args: [id_tesis, id_profesor],
      });
      return result;
    } catch (err) {
      console.error('Error en JuradoRepository.delete:', err.message);
      throw err;
    }
  }

}
