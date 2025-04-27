const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

function createDatabase() {
  const db = new sqlite3.Database('./modlogs.db');

  // Promisify database methods
  db.runAsync = promisify(db.run);
  db.allAsync = promisify(db.all);
  db.getAsync = promisify(db.get);

  // Initialize tables
  db.serialize(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS modlogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        moderator TEXT NOT NULL,
        user TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('warn', 'mute', 'ban', 'kick')),
        reason TEXT NOT NULL,
        duration TEXT,
        evidence TEXT,
        notes TEXT,
        ip_address TEXT
      )`)
      .catch(err => console.error('Database initialization error:', err));
  });

  return db;
}

module.exports = { createDatabase };
