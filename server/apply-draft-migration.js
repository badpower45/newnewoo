#!/usr/bin/env node
import fs from 'fs';
import pg from 'pg';

const { Pool } = pg;

// استخدم الـ DATABASE_URL من الإنتاج
const DATABASE_URL = 'postgresql://postgres:Eymesb69@db.nkyqiwvwttasvqjvtbcg.supabase.co:5432/postgres';

async function applyMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    console.log('📄 Reading migration file...');
    const sql = fs.readFileSync('./migrations/add_draft_products_table.sql', 'utf8');
    
    console.log('🚀 Executing migration...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('🔍 Verifying function exists...');
    
    const result = await client.query(`
      SELECT routine_name, data_type 
      FROM information_schema.routines 
      WHERE routine_name = 'publish_draft_product' 
      AND routine_schema = 'public'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Function publish_draft_product exists:', result.rows);
    } else {
      console.log('⚠️ Function not found in database');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

applyMigration();
