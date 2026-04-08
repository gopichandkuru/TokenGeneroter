// db.js — SQLite3 Database Connection & Setup
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "queue.db");

// Create persistent connection to queue.db
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
  } else {
    console.log("📂 Connected to SQLite database at", DB_PATH);
  }
});

// --- Promise wrappers for async/await usage ---

/** Run INSERT / UPDATE / DELETE — returns { lastID, changes } */
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/** Get a single row */
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/** Get all matching rows */
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/** Create tokens table if it doesn't exist */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_number INTEGER UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'waiting',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("❌ Error creating table:", err.message);
          reject(err);
        } else {
          console.log("✅ Database initialized — 'tokens' table is ready.");
          resolve();
        }
      }
    );
  });
}

module.exports = { db, dbRun, dbGet, dbAll, initializeDatabase };
