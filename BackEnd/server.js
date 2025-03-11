/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sessionMiddleware = require('./config/session');
const corsOptions = require('./config/cors');
const authRoutes = require('./routes/auth');
const imagesRoutes = require('./routes/images');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const securityHeaders = (req, res, next) => {
  res.set({
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "default-src 'self'"
  });
  next();
};

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(require('compression')());
app.use(sessionMiddleware);

// Sirve las imágenes estáticas
const imagesFolder = "C:/Users/alex1/OneDrive/Imágenes/borrar";
app.use('/images', express.static(imagesFolder));

// Rutas
app.use('/api/auth', authRoutes);
app.use(securityHeaders);
app.use('/api/', apiLimiter);

// Se aplica validación en los endpoints de /api/images para los métodos que envían body
app.use('/api/images', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.body && req.body.file) {
    body('file').isString().trim().escape()(req, res, (err) => {
      if (err) return next(err);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    });
  } else {
    next();
  }
}, imagesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});
