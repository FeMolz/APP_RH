export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro Interno do Servidor';

  // Ocultar a stack trace em produção
  const response = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json(response);
};
