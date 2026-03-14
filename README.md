# Annapoorna Restaurant Management System

A complete full-stack mobile-first bilingual (English + Tamil) restaurant management web application for small South Indian hotels, mess, and tiffin centres in Tamil Nadu, India.

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router v6
- Axios
- Recharts
- Socket.io-client
- React Hot Toast

### Backend
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- Socket.io (WebSocket)
- Multer (Image uploads)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb annapoorna

# Run schema
psql -d annapoorna -f server/db/schema.sql

# Seed data
psql -d annapoorna -f server/db/seed.sql
```

### 2. Backend Setup

```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your database credentials
npm run dev
```

Backend will run on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd client
npm install
cp ../.env.example .env.local
# Edit .env.local with API URL
npm run dev
```

Frontend will run on `http://localhost:5173`

## Default Credentials

### Restaurant ID
`550e8400-e29b-41d4-a716-446655440000`

### Users
- **Owner**: PIN `1234`
- **Waiter 1**: PIN `1111`
- **Waiter 2**: PIN `2222`

## Project Structure

```
annapoorna/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
├── server/          # Node.js backend
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── db/
│   └── uploads/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with PIN
- `POST /api/auth/verify` - Verify token

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/stats` - Get table statistics
- `PUT /api/tables/:id/status` - Update table status

### Menu
- `GET /api/menu` - Get available menu items
- `GET /api/menu/all` - Get all menu items (owner only)
- `POST /api/menu/items` - Create menu item (owner only)
- `PUT /api/menu/items/:id` - Update menu item (owner only)
- `DELETE /api/menu/items/:id` - Delete menu item (owner only)

### Orders
- `GET /api/orders` - Get active orders
- `GET /api/orders/history` - Get order history
- `POST /api/orders` - Create order
- `DELETE /api/orders/:id` - Cancel order

### Bills
- `POST /api/bills/generate/:order_id` - Generate bill
- `GET /api/bills/:id` - Get bill details
- `PATCH /api/bills/:id/pay` - Mark bill as paid

### Dashboard (Owner only)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/hourly` - Get hourly sales
- `GET /api/dashboard/top-items` - Get top selling items

## Features

- ✅ Role-based authentication (Owner/Waiter)
- ✅ Table management with real-time status
- ✅ Menu browsing and order taking
- ✅ Bill generation and payment tracking
- ✅ Owner dashboard with analytics
- ✅ Menu management (CRUD operations)
- ✅ Order history
- ✅ Bilingual support (English/Tamil)
- ✅ Real-time updates via WebSocket
- ✅ Mobile-first responsive design

## Development

```bash
# Run backend in development mode
cd server && npm run dev

# Run frontend in development mode
cd client && npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build frontend: `cd client && npm run build`
3. Serve frontend build with Express static middleware
4. Use PM2 or similar for process management
5. Configure PostgreSQL connection pooling
6. Set up SSL certificates for HTTPS

## License

Proprietary - All rights reserved

