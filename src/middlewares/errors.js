/**
 * Middleware global para el manejo de errores.
 * Captura errores de validación, sintaxis y errores generales del servidor.
 * @param {Object|Error} err - El error capturado.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función middleware.
 */
const handleErrors = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación.",
      errors: err.details.map((detail) => detail.message),
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Error de sintaxis en el JSON.",
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    success: false,
    message: "Ha ocurrido un error en el servidor.",
    error: err.message,
  });
};

export default handleErrors;
