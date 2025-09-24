import db from "./db.js";

export async function initDb() {
  // Ensure foreign key constraints are enforced
  await db.execute("PRAGMA foreign_keys = ON;");

  // Sede
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Sede (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      Direccion TEXT NOT NULL,
      telefono TEXT NOT NULL
    );
  `);

  // Carrera
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Carrera (
      codigo INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      campo TEXT NOT NULL
    );
  `);

  // Profesor
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Profesor (
      ci INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT NOT NULL
    );
  `);

  // Encargado
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Encargado (
      ci INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      telefono TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      id_sede INTEGER NOT NULL,
      FOREIGN KEY (id_sede) REFERENCES Sede(id)
    );
  `);

  // Estudiante
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Estudiante (
      ci INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT NOT NULL
    );
  `);

  // Tesis
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Tesis (
      id INTEGER PRIMARY KEY,
      id_encargado INTEGER NOT NULL,
      id_sede INTEGER NOT NULL,
      id_tutor INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL,
      archivo_pdf BLOB,
      FOREIGN KEY (id_encargado) REFERENCES Encargado(ci),
      FOREIGN KEY (id_sede) REFERENCES Sede(id),
      FOREIGN KEY (id_tutor) REFERENCES Profesor(ci)
    );
  `);

  // jurado (lowercase as used in queries)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS jurado (
      id_tesis INTEGER NOT NULL,
      id_profesor INTEGER NOT NULL,
      PRIMARY KEY (id_tesis, id_profesor),
      FOREIGN KEY (id_tesis) REFERENCES Tesis(id),
      FOREIGN KEY (id_profesor) REFERENCES Profesor(ci)
    );
  `);

  // Alumno_tesis
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Alumno_tesis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_estudiante INTEGER NOT NULL,
      id_tesis INTEGER NOT NULL,
      FOREIGN KEY (id_estudiante) REFERENCES Estudiante(ci),
      FOREIGN KEY (id_tesis) REFERENCES Tesis(id)
    );
  `);

  // Alumno_carrera
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Alumno_carrera (
      codigo INTEGER PRIMARY KEY,
      id_estudiante INTEGER NOT NULL,
      id_carrera INTEGER NOT NULL,
      FOREIGN KEY (id_estudiante) REFERENCES Estudiante(ci),
      FOREIGN KEY (id_carrera) REFERENCES Carrera(codigo)
    );
  `);

  // Carrera_tesis
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Carrera_tesis (
      id INTEGER PRIMARY KEY,
      id_carrera INTEGER NOT NULL,
      id_tesis INTEGER NOT NULL,
      FOREIGN KEY (id_carrera) REFERENCES Carrera(codigo),
      FOREIGN KEY (id_tesis) REFERENCES Tesis(id)
    );
  `);
} 