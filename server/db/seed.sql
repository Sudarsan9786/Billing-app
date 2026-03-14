-- Seed Data for Annapoorna Restaurant Management System

-- Insert Restaurant
INSERT INTO restaurants (id, name, name_tamil, address, phone, gstin) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Annapoorna', 'அன்னபூர்ணா', '123 Main Street, Chennai, Tamil Nadu', '9876543210', '29ABCDE1234F1Z5');

-- Insert Users
INSERT INTO users (id, restaurant_id, name, role, pin) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Anna Owner', 'owner', '1234'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Raju Waiter', 'waiter', '1111'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Priya Waiter', 'waiter', '2222');

-- Insert Dining Tables (12 tables)
INSERT INTO dining_tables (restaurant_id, table_number, capacity, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 1, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 2, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 3, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 4, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 5, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 6, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 7, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 8, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 9, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 10, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 11, 4, 'available'),
('550e8400-e29b-41d4-a716-446655440000', 12, 4, 'available');

-- Insert Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, name_tamil, sort_order) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Tiffin', 'டிஃபின்', 1),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Meals', 'உணவு', 2),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Drinks', 'பானங்கள்', 3),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Snacks', 'சிற்றுண்டி', 4),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Desserts', 'இனிப்பு', 5);

-- Insert Menu Items
INSERT INTO menu_items (restaurant_id, category_id, name, name_tamil, price, is_vegetarian, is_available) VALUES
-- Tiffin Items
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Ghee Roast Dosa', 'நெய் ரோஸ்ட் தோசை', 85.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Medhu Vada (2 pcs)', 'மெது வடை', 45.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Idli (2 pcs)', 'இட்லி', 35.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Pongal', 'பொங்கல்', 60.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Poori Masala', 'பூரி மசாலா', 70.00, true, true),
-- Meals
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'South Indian Thali', 'தென்னிந்திய தாலி', 120.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'Veg Biryani', 'வெஜ் பிரியாணி', 110.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'Curd Rice', 'தயிர் சாதம்', 50.00, true, true),
-- Drinks
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'Filter Coffee', 'பில்டர் காபி', 25.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'Tea', 'தேநீர்', 15.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'Fresh Lime Soda', 'புதிய எலுமிச்சை சோடா', 30.00, true, true),
-- Snacks
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 'Samosa (2 pcs)', 'சமோசா', 40.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 'Bonda (2 pcs)', 'பொண்டா', 35.00, true, true),
-- Desserts
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440004', 'Gulab Jamun (2 pcs)', 'குலாப் ஜாமுன்', 50.00, true, true),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440004', 'Payasam', 'பாயாசம்', 45.00, true, true);

