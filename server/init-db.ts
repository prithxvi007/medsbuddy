import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@shared/schema';

export async function initializeDatabase() {
  try {
    const sqlite = new Database('sqlite.db');
    const db = drizzle(sqlite, { schema });
    
    // Create tables manually since drizzle push doesn't work with current config
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('patient', 'caretaker')),
        created_at INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        times TEXT,
        notes TEXT,
        created_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS medication_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medication_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        taken_at INTEGER NOT NULL,
        scheduled_for TEXT NOT NULL,
        created_at INTEGER,
        FOREIGN KEY (medication_id) REFERENCES medications(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    
    console.log('Database tables created successfully');
    sqlite.close();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}