import express from 'express';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all available menu items (for waiters)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categoriesResult = await pool.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY sort_order',
      [req.restaurantId]
    );

    const itemsResult = await pool.query(
      `SELECT mi.*, mc.name as category_name, mc.name_tamil as category_name_tamil
       FROM menu_items mi
       JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.restaurant_id = $1 AND mi.is_available = true
       ORDER BY mc.sort_order, mi.name`,
      [req.restaurantId]
    );

    // Group items by category
    const menu = categoriesResult.rows.map(category => ({
      ...category,
      items: itemsResult.rows.filter(item => item.category_id === category.id)
    }));

    res.json(menu);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all menu items including unavailable (owner only)
router.get('/all', authMiddleware, roleMiddleware(['owner']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mi.*, mc.name as category_name, mc.name_tamil as category_name_tamil
       FROM menu_items mi
       JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.restaurant_id = $1
       ORDER BY mc.sort_order, mi.name`,
      [req.restaurantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY sort_order',
      [req.restaurantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create menu item (owner only)
router.post('/items', authMiddleware, roleMiddleware(['owner']), upload.single('image'), async (req, res) => {
  try {
    const { name, name_tamil, price, category_id, is_vegetarian, is_available } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO menu_items (restaurant_id, category_id, name, name_tamil, price, image_url, is_vegetarian, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.restaurantId, category_id, name, name_tamil, parseFloat(price), imageUrl, is_vegetarian === 'true', is_available === 'true']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu item (owner only)
router.put('/items/:id', authMiddleware, roleMiddleware(['owner']), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_tamil, price, category_id, is_vegetarian, is_available } = req.body;

    let updateQuery = `UPDATE menu_items SET 
      name = $1, name_tamil = $2, price = $3, category_id = $4, 
      is_vegetarian = $5, is_available = $6, updated_at = NOW()`;
    let queryParams = [name, name_tamil, parseFloat(price), category_id, is_vegetarian === 'true', is_available === 'true'];

    if (req.file) {
      updateQuery += ', image_url = $7';
      queryParams.push(`/uploads/${req.file.filename}`);
      queryParams.push(id, req.restaurantId);
    } else {
      queryParams.push(id, req.restaurantId);
    }

    updateQuery += ' WHERE id = $' + (queryParams.length - 1) + ' AND restaurant_id = $' + queryParams.length + ' RETURNING *';

    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu item (owner only)
router.delete('/items/:id', authMiddleware, roleMiddleware(['owner']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2 RETURNING *',
      [id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle availability (owner only)
router.patch('/items/:id/toggle', authMiddleware, roleMiddleware(['owner']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE menu_items 
       SET is_available = NOT is_available, updated_at = NOW()
       WHERE id = $1 AND restaurant_id = $2
       RETURNING *`,
      [id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

