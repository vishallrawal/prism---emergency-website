const express = require('express');
const cors = require('cors');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./db');
const openapi = require('./openapi');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/api/openapi.json', (req, res) => res.json(openapi));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'prism-local-development-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blood-donors', require('./routes/bloodDonors'));
app.use('/api/services', require('./routes/services'));
app.use('/api/maps', require('./routes/maps'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.get('/api/health', (req, res) => {
  res.json({
    status: 'PRISM Backend running ',
    port: PORT,
    time: new Date().toISOString()
  });
});
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      name: 'PRISM Backend API',
      status: 'running',
      documentation: '/api/docs',
      openapi: '/api/openapi.json',
      health: '/api/health'
    });
  });
}
const frontendDistPath = path.join(__dirname, '../frontend/dist');
// Vite owns all frontend routes during development. Serving the old build here
// caused http://localhost:5000/admin/dashboard to look like a second app.
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n==============================================`);
      console.log(` PRISM Backend Server Started Successfully!`);
      console.log(` Express Port: http://localhost:${PORT}`);
      console.log(` Connected to MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prism_surat'}`);
      console.log(` API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==============================================\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
