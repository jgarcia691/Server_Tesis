import express from "express";
import cors from "cors";
import tesisRoutes from "./src/tesis/routes.js"; 
import routesEncargado from "./src/encargado/routes.js"; 
import routesCarrera from "./src/carrera/routes.js";
import routesProfesor from "./src/profesor/routes.js";
import routesJurado from "./src/jurado/routes.js";
import estudiantesroutes from "./src/estudiantes/routes.js"; 
import sederoutes from "./src/sede/routes.js"; 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


app.use("/api", tesisRoutes); 
app.use("/api/encargado", routesEncargado); 
app.use("/api/carrera",routesCarrera);
app.use("/api/profesor",routesProfesor);
app.use("/api/jurado", routesJurado);
app.use("/api/sede",sederoutes);
app.use("/api/estudiantes",estudiantesroutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
