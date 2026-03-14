import express from 'express';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all tables
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              COALESCE(o.total_amount, 0) as current_bill_amount
       FROM dining_tables t
       LEFT JOIN orders o ON t.current_order_id = o.id AND o.status = 'active'
       WHERE t.restaurant_id = $1
       ORDER BY t.table_number`,
      [req.restaurantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get table stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'occupied') as occupied,
        COUNT(*) as total
       FROM dining_tables
       WHERE restaurant_id = $1`,
      [req.restaurantId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update table status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'occupied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await pool.query(
      'UPDATE dining_tables SET status = $1 WHERE id = $2 AND restaurant_id = $3',
      [status, id, req.restaurantId]
    );

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('table:updated', { tableId: id, status });

    res.json({ message: 'Table status updated' });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

