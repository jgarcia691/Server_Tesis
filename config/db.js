import mysql from "mysql";

const db = mysql.createConnection({
    host: "185.144.159.145", // Ajusta con tu host
    user: "root",      // Ajusta con tu usuario
    password: "Unegservice25$",      // Ajusta con tu contraseña
    database: "SERVICE", // Ajusta con tu nombre de base de datos
});
// const db = mysql.createConnection({
//     host: "127.0.0.1",
//     user: "root",
//     password: "",
//     database: "SERVICE"
// })

db.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return;
    }
    console.log("Conectado a la base de datos");
});

export default db;  // Asegúrate de que sea exportado con `export default`
