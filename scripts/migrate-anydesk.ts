// Migration script to add anydesk columns
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || join(__dirname, '../data.db');

console.log('🔧 Running migration: Add anydesk columns');
console.log('📁 Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(partners)").all() as any[];
  const hasAnydeskId = tableInfo.some((col: any) => col.name === 'anydesk_id');
  const hasAnydeskPassword = tableInfo.some((col: any) => col.name === 'anydesk_password');
  
  if (hasAnydeskId && hasAnydeskPassword) {
    console.log('✅ Columns already exist, skipping migration');
    db.close();
    process.exit(0);
  }
  
  console.log('📝 Adding anydesk columns...');
  
  if (!hasAnydeskId) {
    db.prepare('ALTER TABLE partners ADD COLUMN anydesk_id TEXT').run();
    console.log('✅ Added anydesk_id column');
  }
  
  if (!hasAnydeskPassword) {
    db.prepare('ALTER TABLE partners ADD COLUMN anydesk_password TEXT').run();
    console.log('✅ Added anydesk_password column');
  }
  
  console.log('✅ Migration completed successfully');
  
  db.close();
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
