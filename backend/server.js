const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.log(`${req.method} ${req.path}`);
    next();
});

// Database Connection
const connectDB = async () => {
    try {
          await mongoose.connect(process.env.MONGODB_URI, {
                  useNewUrlParser: true,
                  useUnifiedTopology: true,
          });
          logger.log('MongoDB connected successfully');
    } catch (error) {
          logger.error(`MongoDB connection failed: ${error.message}`);
          process.exit(1);
    }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/shopify', require('./routes/shopify'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
});
