import express from "express";
import cors from "cors";
import tesisRoutes from "./src/tesis/routes.js"; // Asegúrate de que la ruta es correcta

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", tesisRoutes); // Prefijo para las rutas de tesis

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
