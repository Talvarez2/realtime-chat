const Database = require('better-sqlite3');
const db = new Database('chat.db');

db.exec(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL
)`);

const insertStmt = db.prepare('INSERT INTO messages (room, username, content, timestamp) VALUES (?, ?, ?, ?)');
const selectStmt = db.prepare('SELECT username, content, timestamp FROM messages WHERE room = ? ORDER BY id DESC LIMIT 50');

function saveMessage(room, username, content, timestamp) {
  insertStmt.run(room, username, content, timestamp);
}

function getMessages(room) {
  return selectStmt.all(room).reverse();
}

module.exports = { saveMessage, getMessages };
