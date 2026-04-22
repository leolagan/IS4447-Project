//This opens the SQLite database and creates all five tables if they do not already exist
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('habittracker_v2.db');

//This creates the users table
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

//This creates the categories table
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT
  );
`);

//This adds the icon column to categories if it was missing from an older database version
try { sqlite.execSync(`ALTER TABLE categories ADD COLUMN icon TEXT`); } catch {}

//This creates the habits table
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    unit TEXT NOT NULL,
    category_id INTEGER NOT NULL
  );
`);

//This creates the habit_logs table
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    notes TEXT
  );
`);

//This creates the targets table
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    habit_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    goal INTEGER NOT NULL,
    direction TEXT NOT NULL DEFAULT 'min'
  );
`);

//This creates the Drizzle ORM client from the SQLite connection
export const db = drizzle(sqlite);