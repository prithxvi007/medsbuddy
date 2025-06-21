// server/db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

// Initialize the SQLite database connection
const sqlite = new Database("sqlite.db", { verbose: console.log });

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema });

// Export raw database instance for custom queries
export const rawDB = sqlite;
