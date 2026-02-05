const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token - Required authentication
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
          return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.userId = decoded.id;
          const user = await User.findById(decoded.id);

      if (!user) {
              return res.status(404).json({ error: 'User not found' });
      }

      req.user = user;
          next();
    } catch (error) {
          return res.status(401).json({ error: 'Not authorized to access this route' });
    }
};

// Generate JWT Token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
    });
};

// Optional authentication - doesn't block if no token
exports.optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
          try {
                  const decoded = jwt.verify(token, process.env.JWT_SECRET);
                  req.userId = decoded.id;
                  req.user = await User.findById(decoded.id);
          } catch (error) {
                  // Token invalid but optional, continue
          }
    }

    next();
};
