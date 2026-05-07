import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../market.db');

console.log(`[DB] Initializing database at ${dbPath}`);

const db = new Database(dbPath);

try {
  // Initialize Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS backtests (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      strategy TEXT NOT NULL,
      pnl REAL,
      max_drawdown REAL,
      sharpe_ratio REAL,
      trades_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('[DB] Schema initialized successfully');
} catch (error) {
  console.error('[DB] Failed to initialize schema:', error);
}

export default db;
