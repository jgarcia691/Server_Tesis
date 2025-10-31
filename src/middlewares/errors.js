
const handleErrors = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación.',
      errors: err.details.map(detail => detail.message),
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Error de sintaxis en el JSON.',
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error en el servidor.',
    error: err.message,
  });
};

export default handleErrors;
