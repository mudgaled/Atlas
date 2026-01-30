const notFound = (req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
};

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // Log error to console
  console.error(err);

  let error = { ...err };

  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    // Check if errmsg exists and has expected format
    if (err.errmsg) {
      const matches = err.errmsg.match(/(["'])(\\?.)*?\1/);
      if (matches && matches.length > 0) {
        const value = matches[0];
        const message = `Duplicate field value entered: ${value}`;
        error = { message, statusCode: 400 };
      } else {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
      }
    } else {
      const message = 'Duplicate field value entered';
      error = { message, statusCode: 400 };
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };