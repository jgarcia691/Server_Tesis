import express from 'express'
import mysql from 'mysql'
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const db= mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"service"
})

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

app.listen(8081, ()=> {
    console.log("Listening");
})