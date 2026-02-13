import db from "./db.js";

export async function initDb() {
  // Ensure foreign key constraints are enforced
  await db.execute("PRAGMA foreign_keys = ON;");

  // Sede
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Sede (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      direccion TEXT NOT NULL,
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

  // --- TABLAS DE PERSONAS Y ROLES ---

  // 1. Tabla Central 'Persona' (Supertipo)
  // Almacena toda la información personal común.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Persona (
      ci INTEGER PRIMARY KEY,
      ci_type TEXT NOT NULL,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefono TEXT NOT NULL
    );
  `);

  // 2. Tabla 'Profesor' (Subtipo de Persona)
  // Solo indica QUÉ persona es un profesor.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Profesor (
      profesor_ci INTEGER PRIMARY KEY,
      FOREIGN KEY (profesor_ci) REFERENCES Persona(ci) ON DELETE CASCADE
    );
  `);

  // 3. Tabla 'Estudiante' (Subtipo de Persona)
  // Solo indica QUÉ persona es un estudiante.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Estudiante (
      estudiante_ci INTEGER PRIMARY KEY,
      FOREIGN KEY (estudiante_ci) REFERENCES Persona(ci) ON DELETE CASCADE
    );
  `);

  // 4. Tabla 'Encargado' (Subtipo de Persona)
  // Indica QUÉ persona es un encargado y A QUÉ sede pertenece.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Encargado (
      encargado_ci INTEGER PRIMARY KEY,
      id_sede INTEGER NOT NULL,
      FOREIGN KEY (encargado_ci) REFERENCES Persona(ci) ON DELETE CASCADE,
      FOREIGN KEY (id_sede) REFERENCES Sede(id) ON DELETE CASCADE
    );
  `);

  // --- TABLAS DEL SISTEMA Y RELACIONES ---

  // Users
  // Ahora user_ci apunta a Persona(ci) para asegurar que el usuario existe.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_ci INTEGER NOT NULL UNIQUE,
      user_type TEXT NOT NULL, -- 'encargado', 'profesor', or 'estudiante'
      password TEXT NOT NULL,
      FOREIGN KEY (user_ci) REFERENCES Persona(ci) ON DELETE CASCADE
    );
  `);

  // Tesis
  // Las llaves foráneas apuntan a las nuevas tablas de roles.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Tesis (
      id TEXT PRIMARY KEY,
      id_encargado INTEGER NOT NULL,
      id_sede INTEGER NOT NULL,
      id_tutor INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL CHECK(estado IN ('rechazado', 'en revisión', 'aprobado', 'pendiente')), -- Assuming these are the possible states
      archivo_url TEXT,
      terabox_fs_id TEXT,
      FOREIGN KEY (id_encargado) REFERENCES Encargado(encargado_ci) ON DELETE CASCADE,
      FOREIGN KEY (id_sede) REFERENCES Sede(id) ON DELETE CASCADE,
      FOREIGN KEY (id_tutor) REFERENCES Profesor(profesor_ci) ON DELETE CASCADE
    );
  `);

  // Jurado
  // La llave foránea apunta a la nueva tabla de rol.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Jurado (
      id_tesis TEXT NOT NULL,
      id_profesor INTEGER NOT NULL,
      PRIMARY KEY (id_tesis, id_profesor),
      FOREIGN KEY (id_tesis) REFERENCES Tesis(id) ON DELETE CASCADE,
      FOREIGN KEY (id_profesor) REFERENCES Profesor(profesor_ci) ON DELETE CASCADE
    );
  `);

  // Alumno_tesis
  // La llave foránea apunta a la nueva tabla de rol.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Alumno_tesis (
      id_estudiante INTEGER NOT NULL,
      id_tesis TEXT NOT NULL,
      FOREIGN KEY (id_estudiante) REFERENCES Estudiante(estudiante_ci) ON DELETE CASCADE,
      FOREIGN KEY (id_tesis) REFERENCES Tesis(id) ON DELETE CASCADE,
      PRIMARY KEY (id_tesis, id_estudiante)
    );
  `);

  // Alumno_carrera
  // La llave foránea apunta a la nueva tabla de rol.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Alumno_carrera (
      id_estudiante INTEGER NOT NULL,
      id_carrera INTEGER NOT NULL,
      FOREIGN KEY (id_estudiante) REFERENCES Estudiante(estudiante_ci) ON DELETE CASCADE,
      FOREIGN KEY (id_carrera) REFERENCES Carrera(codigo) ON DELETE CASCADE,
      PRIMARY KEY (id_estudiante, id_carrera)
    );
  `);

  // Carrera_tesis
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Carrera_tesis (
      id INTEGER PRIMARY KEY,
      id_carrera INTEGER NOT NULL,
      id_tesis TEXT NOT NULL,
      FOREIGN KEY (id_carrera) REFERENCES Carrera(codigo) ON DELETE CASCADE,
      FOREIGN KEY (id_tesis) REFERENCES Tesis(id) ON DELETE CASCADE
    );
  `);
}
