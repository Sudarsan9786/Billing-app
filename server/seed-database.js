// Seed database using Node.js (no psql required)
// Run with: node seed-database.js

import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/annapoorna',
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Annapoorna database...\n');

    // Read and execute seed.sql
    const seedSQL = readFileSync(join(__dirname, 'db', 'seed.sql'), 'utf8');
    
    // Remove comments and split by semicolons
    const cleanedSQL = seedSQL
      .split('\n')
      .map(line => {
        // Remove inline comments (-- comments)
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');
    
    // Split by semicolons and execute each statement
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        // Ignore duplicate key errors (if already seeded)
        if (!error.message.includes('duplicate key') && 
            !error.message.includes('already exists') &&
            !error.message.includes('violates unique constraint')) {
          console.warn('Warning:', error.message.substring(0, 100));
        }
      }
    }

    // Verify seeding
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const restaurantsResult = await pool.query('SELECT COUNT(*) as count FROM restaurants');
    const tablesResult = await pool.query('SELECT COUNT(*) as count FROM dining_tables');
    const menuItemsResult = await pool.query('SELECT COUNT(*) as count FROM menu_items');

    console.log('✅ Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`  - Restaurants: ${restaurantsResult.rows[0].count}`);
    console.log(`  - Users: ${usersResult.rows[0].count}`);
    console.log(`  - Tables: ${tablesResult.rows[0].count}`);
    console.log(`  - Menu Items: ${menuItemsResult.rows[0].count}\n`);

    // Show users
    const users = await pool.query('SELECT name, role, restaurant_id FROM users');
    console.log('Users created:');
    users.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.role})`);
    });

    await pool.end();
    console.log('\n✅ Done! You can now test the login endpoint.');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.log('\nMake sure:');
    console.log('  1. PostgreSQL is running');
    console.log('  2. Database "annapoorna" exists');
    console.log('  3. DATABASE_URL is correct in .env');
    console.log('  4. Schema has been run (run schema.sql first)');
    process.exit(1);
  }
}

seedDatabase();

