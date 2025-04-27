import { Sequelize, DataTypes } from 'sequelize';


const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql', // Puedes usar el dialecto que prefieras
});


const Tesis = sequelize.define('Tesis', {
  nombre: { type: DataTypes.STRING },
  fecha: { type: DataTypes.DATE },
  status: { type: DataTypes.BOOLEAN },
  nota: { type: DataTypes.INTEGER },
}, { timestamps: false });


const Encargado = sequelize.define('Encargado', {
  nombre: { type: DataTypes.STRING },
  apellido: { type: DataTypes.STRING },
  cedula: { type: DataTypes.INTEGER },
  telefono: { type: DataTypes.INTEGER },
  authorizacion: { type: DataTypes.BOOLEAN },
}, { timestamps: false });


const Profesor = sequelize.define('Profesor', {
  nombre: { type: DataTypes.STRING },
  apellido: { type: DataTypes.STRING },
  telefono: { type: DataTypes.INTEGER },
  cedula: { type: DataTypes.INTEGER },
}, { timestamps: false });


const Jurados = sequelize.define('Jurados', {
  fecha: { type: DataTypes.DATE },
}, { timestamps: false });


const Sede = sequelize.define('Sede', {
  nombre: { type: DataTypes.STRING },
  ubicacion: { type: DataTypes.STRING },
  telefono: { type: DataTypes.INTEGER },
}, { timestamps: false });


const Estudiante = sequelize.define('Estudiante', {
  nombre: { type: DataTypes.STRING },
  apellido: { type: DataTypes.STRING },
  telefono: { type: DataTypes.INTEGER },
  cedula: { type: DataTypes.INTEGER },
}, { timestamps: false });


const Carrera = sequelize.define('Carrera', {
  nombre: { type: DataTypes.STRING },
  universidad: { type: DataTypes.STRING },
  codigo_carrera: { type: DataTypes.INTEGER },
}, { timestamps: false });


const CarreraTesis = sequelize.define('CarreraTesis', {}, { timestamps: false });

const EstudianteTesis = sequelize.define('EstudianteTesis', {}, { timestamps: false });

const CarreraEstudiante = sequelize.define('CarreraEstudiante', {}, { timestamps: false });


Estudiante.belongsToMany(Tesis, { through: EstudianteTesis });
Tesis.belongsToMany(Estudiante, { through: EstudianteTesis });


Carrera.belongsToMany(Tesis, { through: CarreraTesis });
Tesis.belongsToMany(Carrera, { through: CarreraTesis });


Estudiante.belongsToMany(Carrera, { through: CarreraEstudiante });
Carrera.belongsToMany(Estudiante, { through: CarreraEstudiante });


Encargado.hasMany(Tesis);
Tesis.belongsTo(Encargado);


Profesor.hasMany(Tesis);
Tesis.belongsTo(Profesor);


Profesor.hasMany(Jurados);
Jurados.belongsTo(Profesor);

Jurados.belongsTo(Tesis);


export {Tesis,Encargado,Profesor,Jurados,Sede,Estudiante,Carrera,CarreraTesis,EstudianteTesis,CarreraEstudiante,
};
