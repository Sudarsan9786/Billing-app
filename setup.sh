#!/bin/bash

echo "🚀 Annapoorna Restaurant Management System - Setup Script"
echo "=================================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup database
echo "📦 Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter PostgreSQL password: " -s DB_PASS
echo ""

read -p "Enter database name (default: annapoorna): " DB_NAME
DB_NAME=${DB_NAME:-annapoorna}

export PGPASSWORD=$DB_PASS

# Create database
echo "Creating database..."
createdb -U $DB_USER $DB_NAME 2>/dev/null || echo "Database may already exist"

# Run schema
echo "Running schema..."
psql -U $DB_USER -d $DB_NAME -f server/db/schema.sql

# Seed data
echo "Seeding data..."
psql -U $DB_USER -d $DB_NAME -f server/db/seed.sql

echo "✅ Database setup complete!"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
fi

# Create .env file
if [ ! -f ".env" ]; then
    cat > .env << EOF
PORT=5001
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
JWT_SECRET=annapoorna_secret_key_2026_change_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
EOF
    echo "✅ Created .env file"
else
    echo "⚠️  .env file already exists"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd server && npm run dev"
echo "  2. Frontend: cd client && npm run dev"
echo ""
echo "Default credentials:"
echo "  - Owner PIN: 1234"
echo "  - Waiter PIN: 1111 or 2222"
echo ""

