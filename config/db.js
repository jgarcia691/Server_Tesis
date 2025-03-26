import mysql from "mysql";

const db = mysql.createConnection({
    host: "localhost", // Ajusta con tu host
    user: "root",      // Ajusta con tu usuario
    password: "",      // Ajusta con tu contraseña
    database: "SERVICE", // Ajusta con tu nombre de base de datos
});

db.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return;
    }
    console.log("Conectado a la base de datos");
});

export default db;  // Asegúrate de que sea exportado con `export default`
