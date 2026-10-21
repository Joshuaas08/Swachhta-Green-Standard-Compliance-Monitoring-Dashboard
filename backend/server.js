const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Morgan HTTP Logger in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/criteria', require('./routes/criteriaRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Swachhta & Green Standard Compliance API',
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Empty database detected. Running automatic initial seed...');
      const seedData = require('./seeder');
      await seedData();
    }

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 Swachhta & Green Server running on port: ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Auto start if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
