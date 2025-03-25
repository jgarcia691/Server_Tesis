import express from 'express';
import cors from 'cors';
import tesisRoutes from './routes/tesis.routes.js'; 
import db from './db.js' // Asegúrate de importar las rutas de tesis correctamente

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Middleware de CORS
app.use(cors());

// Rutas
app.use("/api/tesis", tesisRoutes);

// Puerto de escucha
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
