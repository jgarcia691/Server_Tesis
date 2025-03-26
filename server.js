import express from 'express';
import cors from 'cors';
import tesisRoutes from './routes/tesis.routes.js'; 
import db from './db.js' // Asegúrate de importar las rutas de tesis correctamente

const app = express();

// Middleware para parsear JSON
app.use(express.json());

//// Middleware para parsear URL-encoded bodies (formularios html)
app.use(express.urlencoded({ extended: true }));

// Middleware de CORS
app.use(cors());

app.get(`/getProfesor`,(req,res) =>{
    const {email, password} = req.query;
    const sql = `SELECT * FROM profesor WHERE email='${email}' AND password='${password}'`;    
    db.query(sql, (err,result)=> {
        if(err) return res.json({Message: "Error en el server"});
        console.log("Profesor enviado")
        return res.json(result);
    }) 
})

app.post(`/createProfesor`, (req, res) => {
    const sql = `INSERT INTO profesor (nombre, apellido, ci, email, telefono, password) VALUES (?)`;
    const values = [
        req.body.nombre,
        req.body.apellido,
        req.body.ci,
        req.body.email,
        req.body.telefono,
        req.body.password
    ];  
    db.query(sql, [values], (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        console.log("Profesor agregado")
        return res.json({ Message: "Profesor agregado" });
    });
})

app.get('/',(req,res) =>{
   const sql = "SELECT * FROM estudiante";
   db.query(sql, (err,result)=> {
    if(err) return res.json({Message: "Error inside server"});
    return res.json(result);
   }) 
})

// Rutas
app.use("/api/tesis", tesisRoutes);

// Puerto de escucha
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
