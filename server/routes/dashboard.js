import express from 'express';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authMiddleware, roleMiddleware(['owner']), async (req, res) => {
  try {
    // Today's sales
    const todaySalesResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as today_sales
       FROM bills
       WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'paid'`,
      [req.restaurantId]
    );

    // Yesterday's sales
    const yesterdaySalesResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as yesterday_sales
       FROM bills
       WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day' AND status = 'paid'`,
      [req.restaurantId]
    );

    const todaySales = parseFloat(todaySalesResult.rows[0].today_sales);
    const yesterdaySales = parseFloat(yesterdaySalesResult.rows[0].yesterday_sales);
    const salesChange = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1)
      : 0;

    // Today's bills count
    const todayBillsResult = await pool.query(
      `SELECT COUNT(*) as today_bills
       FROM bills
       WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [req.restaurantId]
    );

    const yesterdayBillsResult = await pool.query(
      `SELECT COUNT(*) as yesterday_bills
       FROM bills
       WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`,
      [req.restaurantId]
    );

    const todayBills = parseInt(todayBillsResult.rows[0].today_bills);
    const yesterdayBills = parseInt(yesterdayBillsResult.rows[0].yesterday_bills);
    const billsChange = yesterdayBills > 0
      ? ((todayBills - yesterdayBills) / yesterdayBills * 100).toFixed(1)
      : 0;

    // Active tables
    const activeTablesResult = await pool.query(
      `SELECT COUNT(*) as active_tables
       FROM dining_tables
       WHERE restaurant_id = $1 AND status = 'occupied'`,
      [req.restaurantId]
    );

    res.json({
      today_sales: todaySales,
      today_bills: todayBills,
      active_tables: parseInt(activeTablesResult.rows[0].active_tables),
      sales_change_percent: parseFloat(salesChange),
      bills_change_percent: parseFloat(billsChange)
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hourly sales data
router.get('/hourly', authMiddleware, roleMiddleware(['owner']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COALESCE(SUM(total_amount), 0) as amount
       FROM bills
       WHERE restaurant_id = $1 
         AND DATE(created_at) = CURRENT_DATE 
         AND status = 'paid'
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY hour`,
      [req.restaurantId]
    );

    // Format hours (8 AM to 9 PM)
    const hours = [];
    for (let h = 8; h <= 21; h++) {
      const hourData = result.rows.find(r => parseInt(r.hour) === h);
      hours.push({
        hour: h <= 12 ? `${h} AM` : `${h - 12} PM`,
        amount: hourData ? parseFloat(hourData.amount) : 0
      });
    }

    res.json(hours);
  } catch (error) {
    console.error('Get hourly sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top selling items
router.get('/top-items', authMiddleware, roleMiddleware(['owner']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        oi.item_name,
        oi.item_name_tamil,
        SUM(oi.quantity) as order_count,
        SUM(oi.total_price) as total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN bills b ON b.order_id = o.id
       WHERE o.restaurant_id = $1 
         AND DATE(b.created_at) = CURRENT_DATE
         AND b.status = 'paid'
       GROUP BY oi.item_name, oi.item_name_tamil
       ORDER BY order_count DESC
       LIMIT 5`,
      [req.restaurantId]
    );

    res.json(result.rows.map(row => ({
      name: row.item_name,
      name_tamil: row.item_name_tamil,
      order_count: parseInt(row.order_count),
      total_revenue: parseFloat(row.total_revenue)
    })));
  } catch (error) {
    console.error('Get top items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

