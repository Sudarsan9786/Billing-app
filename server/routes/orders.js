import express from 'express';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all active orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.table_number, u.name as waiter_name
       FROM orders o
       JOIN dining_tables t ON o.table_id = t.id
       LEFT JOIN users u ON o.waiter_id = u.id
       WHERE o.restaurant_id = $1 AND o.status = 'active'
       ORDER BY o.created_at DESC`,
      [req.restaurantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { filter = 'today', search = '' } = req.query;

    let dateFilter = '';
    if (filter === 'today') {
      dateFilter = "DATE(o.created_at) = CURRENT_DATE";
    } else if (filter === 'week') {
      dateFilter = "o.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (filter === 'month') {
      dateFilter = "o.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else {
      dateFilter = "DATE(o.created_at) = CURRENT_DATE";
    }

    let searchFilter = '';
    if (search) {
      searchFilter = `AND (t.table_number::text LIKE '%${search}%' OR o.id::text LIKE '%${search}%')`;
    }

    const result = await pool.query(
      `SELECT o.*, t.table_number, u.name as waiter_name,
              b.bill_number, b.status as bill_status, b.total_amount as bill_total
       FROM orders o
       JOIN dining_tables t ON o.table_id = t.id
       LEFT JOIN users u ON o.waiter_id = u.id
       LEFT JOIN bills b ON b.order_id = o.id
       WHERE o.restaurant_id = $1 AND ${dateFilter} ${searchFilter}
       ORDER BY o.created_at DESC
       LIMIT 100`,
      [req.restaurantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order with items
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, t.table_number, u.name as waiter_name
       FROM orders o
       JOIN dining_tables t ON o.table_id = t.id
       LEFT JOIN users u ON o.waiter_id = u.id
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [id, req.restaurantId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at',
      [id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { table_id, items } = req.body;

    if (!table_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Table ID and items are required' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Check if table exists and is available
      const tableResult = await pool.query(
        'SELECT * FROM dining_tables WHERE id = $1 AND restaurant_id = $2',
        [table_id, req.restaurantId]
      );

      if (tableResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Table not found' });
      }

      const table = tableResult.rows[0];

      // Check if there's an existing active order
      let orderId = table.current_order_id;
      let isNewOrder = false;

      if (!orderId) {
        // Create new order
        const orderResult = await pool.query(
          `INSERT INTO orders (restaurant_id, table_id, waiter_id, status)
           VALUES ($1, $2, $3, 'active')
           RETURNING *`,
          [req.restaurantId, table_id, req.user.id]
        );

        orderId = orderResult.rows[0].id;
        isNewOrder = true;

        // Update table
        await pool.query(
          'UPDATE dining_tables SET status = $1, current_order_id = $2 WHERE id = $3',
          ['occupied', orderId, table_id]
        );
      }

      // Add items to order
      let subtotal = 0;

      for (const item of items) {
        const menuItemResult = await pool.query(
          'SELECT * FROM menu_items WHERE id = $1 AND restaurant_id = $2',
          [item.menu_item_id, req.restaurantId]
        );

        if (menuItemResult.rows.length === 0) {
          continue;
        }

        const menuItem = menuItemResult.rows[0];
        const quantity = parseInt(item.quantity) || 1;
        const unitPrice = parseFloat(menuItem.price);
        const totalPrice = unitPrice * quantity;

        await pool.query(
          `INSERT INTO order_items (order_id, menu_item_id, item_name, item_name_tamil, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, menuItem.id, menuItem.name, menuItem.name_tamil, quantity, unitPrice, totalPrice]
        );

        subtotal += totalPrice;
      }

      // Calculate GST and total
      const gstRate = 5.0;
      const gstAmount = (subtotal * gstRate) / 100;
      const totalAmount = subtotal + gstAmount;

      // Update order totals
      await pool.query(
        `UPDATE orders SET subtotal = $1, gst_amount = $2, total_amount = $3, updated_at = NOW()
         WHERE id = $4`,
        [subtotal, gstAmount, totalAmount, orderId]
      );

      await pool.query('COMMIT');

      // Emit WebSocket event
      const io = req.app.get('io');
      io.emit('order:created', { orderId, tableId: table_id });

      // Get full order details
      const orderResult = await pool.query(
        `SELECT o.*, t.table_number FROM orders o
         JOIN dining_tables t ON o.table_id = t.id
         WHERE o.id = $1`,
        [orderId]
      );

      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderId]
      );

      res.status(isNewOrder ? 201 : 200).json({
        ...orderResult.rows[0],
        items: itemsResult.rows
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND restaurant_id = $2',
      [id, req.restaurantId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    await pool.query('BEGIN');

    try {
      // Update order status
      await pool.query(
        "UPDATE orders SET status = 'cancelled' WHERE id = $1",
        [id]
      );

      // Free table
      await pool.query(
        "UPDATE dining_tables SET status = 'available', current_order_id = NULL WHERE id = $1",
        [order.table_id]
      );

      await pool.query('COMMIT');

      // Emit WebSocket event
      const io = req.app.get('io');
      io.emit('table:updated', { tableId: order.table_id, status: 'available' });

      res.json({ message: 'Order cancelled' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

