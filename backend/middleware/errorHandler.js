const errorHandler = (err, req, res, next) => {
  // Determine status code. If the error already has a status code, use it. Otherwise, default to 500 (Internal Server Error).
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific error types for more detailed feedback
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400; // Bad Request
    message = err.errors.map(e => e.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409; // Conflict
    message = err.errors.map(e => `${e.path} must be unique.`).join(', ');
  }
  
  // Log the error for debugging purposes, but not in production for security reasons
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: message,
    // Only include the stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export default errorHandler;