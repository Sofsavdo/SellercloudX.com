// Database utility functions for cross-database compatibility
// Handles differences between SQLite and PostgreSQL

import { sql } from 'drizzle-orm';

/**
 * Get current timestamp SQL expression based on database type
 * PostgreSQL: CURRENT_TIMESTAMP
 * SQLite: unixepoch()
 */
export function getCurrentTimestamp(dbType: 'postgres' | 'sqlite' = 'sqlite') {
  if (dbType === 'postgres') {
    return sql`CURRENT_TIMESTAMP`;
  }
  return sql`(unixepoch())`;
}

/**
 * Convert timestamp to JavaScript Date
 * PostgreSQL: returns Date object directly
 * SQLite: returns unix timestamp (number) - needs conversion
 */
export function timestampToDate(value: any): Date | null {
  if (!value) return null;
  
  // If already a Date object (PostgreSQL)
  if (value instanceof Date) {
    return value;
  }
  
  // If unix timestamp (SQLite)
  if (typeof value === 'number') {
    return new Date(value * 1000); // Convert from seconds to milliseconds
  }
  
  // If string timestamp
  if (typeof value === 'string') {
    return new Date(value);
  }
  
  return null;
}

/**
 * Format date for database insertion
 * PostgreSQL: ISO string
 * SQLite: unix timestamp
 */
export function formatDateForDB(date: Date, dbType: 'postgres' | 'sqlite' = 'sqlite'): any {
  if (!date) return null;
  
  if (dbType === 'postgres') {
    return date.toISOString();
  }
  
  // SQLite: unix timestamp
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get database type from environment or connection string
 */
export function getDatabaseType(): 'postgres' | 'sqlite' {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'))) {
    return 'postgres';
  }
  
  return 'sqlite';
}
