import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import LoginService from './services.js';

dotenv.config();

export const postlogincontroller = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(' Intentando iniciar sesión con:', email);

    const user = await LoginService.findByEmailAndPassword(email, password);

    if (!user) {
      console.log(' Credenciales inválidas para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id || user.ci, 
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'clave_secreta', {
      expiresIn: '1h',
    });

    console.log('✅ Login exitoso para:', email);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        ci: user.ci,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(' Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
