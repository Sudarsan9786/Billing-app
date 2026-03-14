-- Annapoorna Restaurant Management System
-- PostgreSQL Database Schema

-- 1. Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_tamil VARCHAR(100),
  address TEXT,
  phone VARCHAR(15),
  gstin VARCHAR(20),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Users (Owners + Waiters)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(10) CHECK (role IN ('owner', 'waiter')) NOT NULL,
  pin VARCHAR(6) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tables (dining tables)
CREATE TABLE dining_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  capacity INTEGER DEFAULT 4,
  status VARCHAR(10) CHECK (status IN ('available', 'occupied')) DEFAULT 'available',
  current_order_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- 4. Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  name_tamil VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

-- 5. Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id),
  name VARCHAR(100) NOT NULL,
  name_tamil VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES dining_tables(id),
  waiter_id UUID REFERENCES users(id),
  status VARCHAR(20) CHECK (status IN ('active', 'billed', 'paid', 'cancelled')) DEFAULT 'active',
  subtotal DECIMAL(10,2) DEFAULT 0,
  gst_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  gst_rate DECIMAL(5,2) DEFAULT 5.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name VARCHAR(100) NOT NULL,
  item_name_tamil VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Bills
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  restaurant_id UUID REFERENCES restaurants(id),
  bill_number VARCHAR(20) UNIQUE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'cash',
  status VARCHAR(10) CHECK (status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_restaurant ON users(restaurant_id);
CREATE INDEX idx_tables_restaurant ON dining_tables(restaurant_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_bills_restaurant ON bills(restaurant_id);
CREATE INDEX idx_bills_order ON bills(order_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);

