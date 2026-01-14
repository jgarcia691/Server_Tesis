# 📚 Sistema de Gestión de Tesis - Backend API

Backend RESTful API para la gestión de tesis universitarias, desarrollado con Node.js, Express y Turso (LibSQL).

> **Frontend**: El cliente web de este proyecto se encuentra en [https://github.com/Jennorg/tesisup](https://github.com/Jennorg/tesisup)

## 🚀 Características

- **Gestión completa de tesis**: CRUD de tesis con soporte para múltiples autores y jurados
- **Almacenamiento en la nube**: Integración con Terabox para almacenar archivos PDF
- **Descarga masiva**: Sistema de descarga de múltiples tesis con seguimiento de progreso en tiempo real (SSE)
- **Filtrado avanzado**: Búsqueda por nombre, fecha, sede, tutor, encargado, estudiante, jurado y estado
- **Ordenamiento flexible**: Soporte para ordenar por nombre o fecha (ascendente/descendente)
- **Autenticación**: Sistema de autenticación con JWT
- **Gestión de usuarios**: Profesores, estudiantes, encargados y jurados
- **Paginación**: Resultados paginados para mejor rendimiento

## 🛠️ Tecnologías

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de datos**: Turso (LibSQL) - Base de datos distribuida basada en SQLite
- **Almacenamiento**: Terabox API para archivos PDF
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Express middleware personalizado
- **Compresión de archivos**: JSZip para descargas masivas
- **CORS**: Habilitado para aplicaciones frontend

## 📋 Requisitos previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Turso (para la base de datos)
- Cuenta de Terabox (para almacenamiento de archivos)

## ⚙️ Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/jgarcia691/Server_Tesis
   cd Server_Tesis
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   # Turso Database
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-turso-auth-token

   # Terabox Configuration
   TERABOX_NDUS=your-terabox-ndus-cookie
   TERABOX_JSTOKEN=your-terabox-jstoken
   TERABOX_COOKIE=your-terabox-cookie

   # JWT Secret
   JWT_SECRET=your-secret-key

   # Server Port (opcional)
   PORT=8080
   ```

4. **Iniciar el servidor**

   ```bash
   npm start
   ```

   El servidor estará disponible en `http://localhost:8080`

## 📡 API Endpoints

### Tesis

| Método   | Endpoint                | Descripción                        | Query Params                                                                                                                                                        |
| -------- | ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/tesis`                | Obtener todas las tesis (paginado) | `page`, `limit`, `sortBy`, `order`, `cadena`, `estado`, `id_sede`, `id_tutor`, `id_encargado`, `id_estudiante`, `id_jurado`, `nombre`, `fecha_desde`, `fecha_hasta` |
| `GET`    | `/tesis/:id`            | Obtener una tesis por ID           | -                                                                                                                                                                   |
| `GET`    | `/tesis/cadena/:nombre` | Buscar tesis por nombre            | `page`, `limit`                                                                                                                                                     |
| `GET`    | `/tesis/:id/download`   | Descargar PDF de una tesis         | -                                                                                                                                                                   |
| `GET`    | `/tesis/:id/autores`    | Obtener autores de una tesis       | -                                                                                                                                                                   |
| `POST`   | `/tesis`                | Crear nueva tesis                  | -                                                                                                                                                                   |
| `PUT`    | `/tesis/:id`            | Actualizar tesis                   | -                                                                                                                                                                   |
| `PUT`    | `/tesis/:id/status`     | Actualizar estado de tesis         | -                                                                                                                                                                   |
| `DELETE` | `/tesis/:id`            | Eliminar tesis                     | -                                                                                                                                                                   |

### Descarga Masiva

| Método | Endpoint                                 | Descripción                            |
| ------ | ---------------------------------------- | -------------------------------------- |
| `GET`  | `/tesis/download/all`                    | Iniciar descarga de todas las tesis    |
| `GET`  | `/tesis/download/progress/:jobId`        | Obtener progreso de descarga (polling) |
| `GET`  | `/tesis/download/progress/:jobId/stream` | Stream de progreso (SSE)               |
| `GET`  | `/tesis/download/result/:jobId`          | Descargar archivo ZIP resultante       |

### Otros Recursos

- **Estudiantes**: `/estudiantes`
- **Profesores**: `/profesores`
- **Encargados**: `/encargados`
- **Sedes**: `/sedes`
- **Carreras**: `/carreras`
- **Autenticación**: `/auth/login`, `/auth/register`

## 🔍 Ejemplos de uso

### Filtrar tesis con paginación y ordenamiento

```bash
GET /tesis?page=1&limit=10&sortBy=fecha&order=desc&estado=aprobado&id_sede=1
```

### Buscar tesis por jurado específico

```bash
GET /tesis?id_jurado=5
```

### Descargar todas las tesis

```bash
# 1. Iniciar descarga
GET /tesis/download/all
# Respuesta: { "jobId": "uuid-123", "progressUrl": "/tesis/download/progress/uuid-123" }

# 2. Monitorear progreso (SSE)
GET /tesis/download/progress/uuid-123/stream

# 3. Descargar ZIP cuando esté listo
GET /tesis/download/result/uuid-123
```

## 📁 Estructura del proyecto

```
Server_Tesis/
├── config/
│   ├── db.js              # Configuración de Turso
│   └── terabox.js         # Integración con Terabox
├── src/
│   ├── tesis/             # Módulo de tesis
│   │   ├── controllers.js # Lógica de negocio
│   │   ├── routes.js      # Definición de rutas
│   │   └── services.js    # Servicios auxiliares
│   ├── estudiantes/       # Módulo de estudiantes
│   ├── profesores/        # Módulo de profesores
│   ├── auth/              # Autenticación
│   └── middlewares/       # Middlewares personalizados
├── scripts/               # Scripts de utilidad
├── server.js              # Punto de entrada
├── package.json
└── README.md
```

## 📦 Despliegue

El proyecto está configurado para desplegarse en Vercel:

```bash
vercel --prod
```
