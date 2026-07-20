import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const DB_PATH = env.DATABASE_PATH || './data/puppy.db';

// Ensure the parent directory exists (e.g. ./data or /data).
const dir = dirname(DB_PATH);
if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });

const sqlite = new Database(DB_PATH);
// WAL + busy_timeout so two phones logging at once don't hit SQLITE_BUSY.
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
sqlite.pragma('foreign_keys = ON');

// Idempotent schema creation. Keeps the app zero-ops: a fresh container or
// dev machine self-initializes on first import. Kept in sync with schema.ts.
sqlite.exec(`
	CREATE TABLE IF NOT EXISTS dogs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		breed TEXT,
		sex TEXT,
		birth_date INTEGER,
		adoption_date INTEGER,
		photo_path TEXT,
		created_at INTEGER NOT NULL DEFAULT (unixepoch())
	);

	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		pin_hash TEXT NOT NULL,
		color TEXT NOT NULL DEFAULT '#0d9488',
		is_active INTEGER NOT NULL DEFAULT 1,
		created_at INTEGER NOT NULL DEFAULT (unixepoch())
	);

	CREATE TABLE IF NOT EXISTS care_log (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		dog_id INTEGER NOT NULL,
		user_id INTEGER,
		type TEXT NOT NULL,
		occurred_at INTEGER NOT NULL DEFAULT (unixepoch()),
		amount REAL,
		duration_min INTEGER,
		rating INTEGER,
		notes TEXT,
		detail TEXT,
		created_at INTEGER NOT NULL DEFAULT (unixepoch())
	);
	CREATE INDEX IF NOT EXISTS idx_care_dog_type_time ON care_log (dog_id, type, occurred_at);
	CREATE INDEX IF NOT EXISTS idx_care_dog_time ON care_log (dog_id, occurred_at);

	CREATE TABLE IF NOT EXISTS health_events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		dog_id INTEGER NOT NULL,
		category TEXT NOT NULL,
		title TEXT NOT NULL,
		due_date INTEGER,
		completed_at INTEGER,
		vet_name TEXT,
		notes TEXT,
		created_at INTEGER NOT NULL DEFAULT (unixepoch())
	);

	CREATE TABLE IF NOT EXISTS app_settings (
		key TEXT PRIMARY KEY,
		value TEXT
	);
`);

export const db = drizzle(sqlite, { schema });
export { schema };
