import express from "express";
import cors from "cors";
import tesisRoutes from "./src/tesis/routes.js"; 
import routesEncargado from "./src/encargado/routes.js"; 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


app.use("/api", tesisRoutes); 
app.use("/api/encargado", routesEncargado); 

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
