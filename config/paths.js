import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener la ruta raíz del proyecto (dos niveles arriba de config/)
const rootDir = path.resolve(__dirname, '..');

// Rutas absolutas usando path
export const paths = {
  root: rootDir,
  src: path.join(rootDir, 'src'),
  config: path.join(rootDir, 'config'),
  uploads: path.join(rootDir, 'uploads'),
  
  // Rutas específicas de módulos
  auth: path.join(rootDir, 'src', 'auth'),
  tesis: path.join(rootDir, 'src', 'tesis'),
  encargado: path.join(rootDir, 'src', 'encargado'),
  carrera: path.join(rootDir, 'src', 'carrera'),
  profesor: path.join(rootDir, 'src', 'profesor'),
  jurado: path.join(rootDir, 'src', 'jurado'),
  estudiantes: path.join(rootDir, 'src', 'estudiantes'),
  sede: path.join(rootDir, 'src', 'sede'),
  alumno_carrera: path.join(rootDir, 'src', 'alumno_carrera'),
  alumno_tesis: path.join(rootDir, 'src', 'alumno_tesis'),
  carrera_tesis: path.join(rootDir, 'src', 'carrera_tesis'),
  middlewares: path.join(rootDir, 'src', 'middlewares'),
  schemas: path.join(rootDir, 'src', 'schemas')
};

export default paths;
