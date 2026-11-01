const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const morgan = require('morgan');
require('dotenv').config();

// Initialize DB and ensure tables / seed data
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const animalRoutes = require('./routes/animalRoutes');
const statsRoutes = require('./routes/statsRoutes');
const donationRoutes = require('./routes/donationRoutes');

// Import error handlers
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files for uploaded images (serves from local uploads or serverless /tmp)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(os.tmpdir(), 'uploads')));
}

// API Root Health & Welcome Check
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    project: 'Paw Trails Backend API',
    initiative: 'Animal Welfare Initiative by CubeWorkSocial',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth/login',
      adoptions: '/api/adoptions',
      reports: '/api/reports',
      volunteers: '/api/volunteers',
      contact: '/api/contact',
      animals: '/api/animals',
      stats: '/api/stats',
      donations: '/api/donations'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db.isUsingSupabase() ? 'supabase-postgresql' : 'local-json-fallback',
    serverless: !!process.env.VERCEL,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contacts', contactRoutes); // alias
app.use('/api/animals', animalRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/donations', donationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only when executed directly (not when running inside Vercel serverless)
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🐾 PAW TRAILS BACKEND SERVER RUNNING`);
    console.log(`📍 Port: http://localhost:${PORT}`);
    console.log(`⚡ API Root: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
