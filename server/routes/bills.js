import express from 'express';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate bill for order
router.post('/generate/:order_id', authMiddleware, async (req, res) => {
  try {
    const { order_id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, t.table_number
       FROM orders o
       JOIN dining_tables t ON o.table_id = t.id
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [order_id, req.restaurantId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if bill already exists
    const existingBill = await pool.query(
      'SELECT * FROM bills WHERE order_id = $1',
      [order_id]
    );

    if (existingBill.rows.length > 0) {
      // Return existing bill
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order_id]
      );

      return res.json({
        ...existingBill.rows[0],
        order: {
          ...order,
          items: itemsResult.rows
        }
      });
    }

    // Generate bill number
    const year = new Date().getFullYear();
    const billCountResult = await pool.query(
      "SELECT COUNT(*) as count FROM bills WHERE bill_number LIKE $1",
      [`ANN-${year}-%`]
    );
    const billNumber = `ANN-${year}-${String(parseInt(billCountResult.rows[0].count) + 1).padStart(4, '0')}`;

    // Create bill
    const billResult = await pool.query(
      `INSERT INTO bills (order_id, restaurant_id, bill_number, subtotal, gst_amount, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'unpaid')
       RETURNING *`,
      [order_id, req.restaurantId, billNumber, order.subtotal, order.gst_amount, order.total_amount]
    );

    // Update order status
    await pool.query(
      "UPDATE orders SET status = 'billed' WHERE id = $1",
      [order_id]
    );

    // Get order items
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order_id]
    );

    res.status(201).json({
      ...billResult.rows[0],
      order: {
        ...order,
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bill details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const billResult = await pool.query(
      `SELECT b.*, o.table_id, t.table_number, o.created_at as order_created_at
       FROM bills b
       JOIN orders o ON b.order_id = o.id
       JOIN dining_tables t ON o.table_id = t.id
       WHERE b.id = $1 AND b.restaurant_id = $2`,
      [id, req.restaurantId]
    );

    if (billResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = billResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [bill.order_id]
    );

    res.json({
      ...bill,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark bill as paid
router.patch('/:id/pay', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method = 'cash' } = req.body;

    const billResult = await pool.query(
      `SELECT b.*, o.table_id
       FROM bills b
       JOIN orders o ON b.order_id = o.id
       WHERE b.id = $1 AND b.restaurant_id = $2`,
      [id, req.restaurantId]
    );

    if (billResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = billResult.rows[0];

    await pool.query('BEGIN');

    try {
      // Update bill
      await pool.query(
        `UPDATE bills SET status = 'paid', payment_method = $1, paid_at = NOW()
         WHERE id = $2`,
        [payment_method, id]
      );

      // Update order
      await pool.query(
        "UPDATE orders SET status = 'paid' WHERE id = $1",
        [bill.order_id]
      );

      // Free table
      await pool.query(
        "UPDATE dining_tables SET status = 'available', current_order_id = NULL WHERE id = $1",
        [bill.table_id]
      );

      await pool.query('COMMIT');

      // Emit WebSocket events
      const io = req.app.get('io');
      io.emit('bill:paid', { billId: id, tableId: bill.table_id });
      io.emit('table:updated', { tableId: bill.table_id, status: 'available' });

      res.json({ message: 'Bill marked as paid' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Pay bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's bills
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, t.table_number, o.created_at as order_created_at
       FROM bills b
       JOIN orders o ON b.order_id = o.id
       JOIN dining_tables t ON o.table_id = t.id
       WHERE b.restaurant_id = $1 AND DATE(b.created_at) = CURRENT_DATE
       ORDER BY b.created_at DESC`,
      [req.restaurantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get today bills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

