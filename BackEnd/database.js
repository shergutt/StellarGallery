// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define la ruta al archivo de la base de datos SQLite
const dbPath = path.join(__dirname, 'database.sqlite');

// Abre (o crea) la base de datos SQLite
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX, (err) => {
  if (err) {
    console.error("Error opening SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.configure("busyTimeout", 5000);
    db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;");
  }
});

// Crea la tabla users si no existe y la tabla comments
db.serialize(() => {
  // Creación de la tabla users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Users table exists or created successfully.");
    }
  });

  // Creación de la tabla comments
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_file TEXT,
      user_email TEXT,
      comment_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("Error creating comments table:", err.message);
    } else {
      console.log("Comments table exists or created successfully.");
    }
  });
});

module.exports = db;
