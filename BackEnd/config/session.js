// config/session.js
const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 5 * 60 * 60 * 1000, 
    secure: false,              
    sameSite: 'lax',            
  },
});

module.exports = sessionMiddleware;
