class ErrorHandler extends Error {
    constructor(message, statusCode) {
          super(message);
          this.statusCode = statusCode;
    }
}

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong MongoDB ID
    if (err.name === 'CastError') {
          const message = `Resource not found. Invalid: ${err.path}`;
          err = new ErrorHandler(message, 400);
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
          const message = `Duplicate field value entered`;
          err = new ErrorHandler(message, 400);
    }

    // Wrong JWT
    if (err.name === 'JsonWebTokenError') {
          const message = `Json Web Token is invalid, Try again`;
          err = new ErrorHandler(message, 400);
    }

    // JWT EXPIRED
    if (err.name === 'TokenExpiredError') {
          const message = `Json Web Token is expired, Try again`;
          err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
          success: false,
          error: err.message,
    });
};

module.exports = { ErrorHandler, errorMiddleware };
