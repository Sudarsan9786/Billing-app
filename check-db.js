// Quick script to check if database is seeded
// Run with: node check-db.js

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/annapoorna',
});

async function checkDatabase() {
  try {
    console.log('Checking database...\n');

    // Check restaurants
    const restaurants = await pool.query('SELECT * FROM restaurants');
    console.log('Restaurants:', restaurants.rows.length);
    if (restaurants.rows.length > 0) {
      console.log('  -', restaurants.rows[0].name, `(${restaurants.rows[0].id})`);
    }

    // Check users
    const users = await pool.query('SELECT * FROM users');
    console.log('\nUsers:', users.rows.length);
    users.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - Restaurant: ${user.restaurant_id}`);
    });

    // Check specific user for login
    const loginUser = await pool.query(
      `SELECT u.*, r.name as restaurant_name 
       FROM users u 
       JOIN restaurants r ON u.restaurant_id = r.id 
       WHERE u.restaurant_id = $1 AND u.role = $2`,
      ['550e8400-e29b-41d4-a716-446655440000', 'owner']
    );
    
    console.log('\nLogin test query result:');
    if (loginUser.rows.length > 0) {
      console.log('  ✅ User found:', loginUser.rows[0].name);
    } else {
      console.log('  ❌ No user found for restaurant_id and role "owner"');
      console.log('  Run: psql -d annapoorna -f server/db/seed.sql');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\nMake sure:');
    console.log('  1. PostgreSQL is running');
    console.log('  2. Database "annapoorna" exists');
    console.log('  3. DATABASE_URL is correct in .env');
  }
}

checkDatabase();

