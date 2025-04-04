import db from "../../config/db.js";

export class JuradoRepository {

    static async getJurado(id_tesis) {
        return new Promise((resolve, reject) => {
            console.log('buscando: ',id_tesis);
            const sql = "SELECT * FROM jurado WHERE id_tesis = ?";
            db.query(sql, [id_tesis], (err, result) => {
                if (err) return reject(err);
                resolve(result.length ? result[0] : null);
            });
        });
    }

    static async create({ id_tesis, id_profesor}) {
        return new Promise((resolve, reject) => {
          const sql = "DELETE FROM jurado WHERE id_tesis = ?  AND id_profesor = ?";
          db.query(sql, [id_tesis, id_profesor], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }

    static async delete(id_tesis, id_profesor) {
        return new Promise((resolve, reject) => {
          const sql = "DELETE FROM jurado WHERE id_tesis = ? AND id_profesor = ? ";
          console.log("Sentencia SQL a ejecutar:", sql, [id_tesis, id_profesor]);
          db.query(sql, [id_tesis, id_profesor], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    }
}