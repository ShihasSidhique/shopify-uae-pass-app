const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res, next) => {
    try {
          const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
              return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await User.findOne({ email });
          if (existingUser) {
                  return res.status(400).json({ error: 'User already exists' });
          }

      const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
              email,
              password: hashedPassword,
              firstName,
              lastName,
      });

      await user.save();
          logger.log(`User registered: ${email}`);

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d',
      });

      res.status(201).json({
              message: 'User registered successfully',
              token,
              user: { id: user._id, email: user.email },
      });
    } catch (error) {
          logger.error(`Register error: ${error.message}`);
          next(error);
    }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
    try {
          const { email, password } = req.body;

      if (!email || !password) {
              return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
          if (!user) {
                  return res.status(401).json({ error: 'Invalid credentials' });
          }

      const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
                  return res.status(401).json({ error: 'Invalid credentials' });
          }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d',
      });

      logger.log(`User logged in: ${email}`);

      res.json({
              message: 'Login successful',
              token,
              user: { id: user._id, email: user.email },
      });
    } catch (error) {
          logger.error(`Login error: ${error.message}`);
          next(error);
    }
});

// Verify token endpoint
router.post('/verify', auth, async (req, res) => {
    try {
          const user = await User.findById(req.user.userId);
          res.json({
                  message: 'Token is valid',
                  user: { id: user._id, email: user.email },
          });
    } catch (error) {
          logger.error(`Verify error: ${error.message}`);
          res.status(401).json({ error: 'Invalid token' });
    }
});

// Logout endpoint
router.post('/logout', auth, (req, res) => {
    logger.log(`User logged out: ${req.user.userId}`);
    res.json({ message: 'Logout successful' });
});

module.exports = router;
