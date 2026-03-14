import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { restaurant_id, pin, role } = req.body;

    if (!restaurant_id || !pin || !role) {
      return res.status(400).json({ error: 'Restaurant ID, PIN, and role are required' });
    }

    // Find user
    const result = await pool.query(
      `SELECT u.*, r.name as restaurant_name, r.name_tamil as restaurant_name_tamil 
       FROM users u 
       JOIN restaurants r ON u.restaurant_id = r.id 
       WHERE u.restaurant_id = $1 AND u.role = $2 AND u.is_active = true`,
      [restaurant_id, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // For MVP, simple PIN comparison (in production, use bcrypt)
    // PINs: owner=1234, waiter1=1111, waiter2=2222
    const validPins = {
      '550e8400-e29b-41d4-a716-446655440000': {
        owner: '1234',
        waiter: ['1111', '2222']
      }
    };

    let isValid = false;
    if (role === 'owner') {
      isValid = pin === validPins[restaurant_id]?.owner;
    } else {
      isValid = validPins[restaurant_id]?.waiter?.includes(pin);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role, restaurantId: user.restaurant_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        restaurant_id: user.restaurant_id
      },
      restaurant: {
        id: user.restaurant_id,
        name: user.restaurant_name,
        name_tamil: user.restaurant_name_tamil
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
router.post('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;

