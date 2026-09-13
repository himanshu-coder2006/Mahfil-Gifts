export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    errors: [],
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Something went wrong',
    errors: err.errors || [],
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
