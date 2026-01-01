#!/usr/bin/env tsx
/**
 * Database Health Check Script
 * Verifies database schema and connectivity
 */

import { db } from '../server/db';
import { users, partners, marketplaceIntegrations } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  console.log('🔍 Checking database health...\n');

  try {
    // Test basic connectivity
    console.log('1️⃣ Testing database connectivity...');
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection OK\n');

    // Check users table
    console.log('2️⃣ Checking users table...');
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    console.log(`✅ Users table OK (${userCount[0].count} users)\n`);

    // Check partners table
    console.log('3️⃣ Checking partners table...');
    const partnerCount = await db.select({ count: sql<number>`count(*)` }).from(partners);
    console.log(`✅ Partners table OK (${partnerCount[0].count} partners)\n`);

    // Check partners table schema
    console.log('4️⃣ Checking partners table schema...');
    const tableInfo = await db.execute(sql`PRAGMA table_info(partners)`);
    const columns = (tableInfo as any).map((col: any) => col.name);
    console.log('Columns:', columns.join(', '));
    
    const requiredColumns = [
      'id', 'user_id', 'business_name', 'phone', 
      'approved', 'pricing_tier', 'created_at'
    ];
    
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      console.log('⚠️  Missing columns:', missingColumns.join(', '));
    } else {
      console.log('✅ All required columns present');
    }
    
    // Check for anydesk columns
    if (columns.includes('anydesk_id')) {
      console.log('✅ AnyDesk columns present');
    } else {
      console.log('⚠️  AnyDesk columns missing (run migration)');
    }
    console.log();

    // Check marketplace_integrations table
    console.log('5️⃣ Checking marketplace_integrations table...');
    try {
      const integrationCount = await db.select({ count: sql<number>`count(*)` })
        .from(marketplaceIntegrations);
      console.log(`✅ Marketplace integrations table OK (${integrationCount[0].count} connections)\n`);
    } catch (error) {
      console.log('⚠️  Marketplace integrations table may not exist\n');
    }

    // Test insert (rollback)
    console.log('6️⃣ Testing insert operation...');
    try {
      await db.transaction(async (tx) => {
        const testUser = await tx.insert(users).values({
          id: 'test_' + Date.now(),
          username: 'test_' + Date.now(),
          password: 'test',
          role: 'customer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log('✅ Insert test successful (rolled back)');
        throw new Error('Rollback test transaction');
      });
    } catch (error: any) {
      if (error.message === 'Rollback test transaction') {
        console.log('✅ Transaction rollback OK\n');
      } else {
        console.error('❌ Insert test failed:', error.message, '\n');
      }
    }

    console.log('✅ Database health check complete!\n');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Database health check failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkDatabase();
