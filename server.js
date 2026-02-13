import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { paths } from "./config/paths.js";
import { initDb } from "./config/initDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar rutas usando rutas absolutas
import tesisRoutes from "./src/tesis/routes.js";
import routesEncargado from "./src/encargado/routes.js";
import routesCarrera from "./src/carrera/routes.js";
import routesProfesor from "./src/profesor/routes.js";
import routesJurado from "./src/jurado/routes.js";
import estudiantesroutes from "./src/estudiantes/routes.js";
import sederoutes from "./src/sede/routes.js";
import alumno_carreraroutes from "./src/alumno_carrera/routes.js";
import alumno_tesisroutes from "./src/alumno_tesis/routes.js";
import carrera_tesisroutes from "./src/carrera_tesis/routes.js";
import loginroute from "./src/auth/routes.js";
import handleErrors from "./src/middlewares/errors.js";

const app = express();

// Middlewares
app.use(cors({
  origin: true, // Permitir cualquier origen (o especifica tu frontend)
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type']
}));
app.use(express.json());

app.use("/api", tesisRoutes);
app.use("/api/encargado", routesEncargado);
app.use("/api/carrera", routesCarrera);
app.use("/api/profesor", routesProfesor);
app.use("/api/jurado", routesJurado);
app.use("/api/sede", sederoutes);
app.use("/api/estudiantes", estudiantesroutes);
app.use("/api/alumno_carrera", alumno_carreraroutes);
app.use("/api/alumno_tesis", alumno_tesisroutes);
app.use("/api/carrera_tesis", carrera_tesisroutes);
app.use("/api", loginroute);

// Error handling middleware
app.use(handleErrors);

const PORT = process.env.PORT || 8080;

// Exportar app para testing
export default app;

// Solo iniciar el servidor si se ejecuta directamente este archivo
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      await initDb();
      console.log("Base de datos inicializada.");
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Error inicializando la base de datos:", err.message);
      process.exit(1);
    }
  })();
}
