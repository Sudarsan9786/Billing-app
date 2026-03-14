# Debugging Login Endpoint

## Issue
Login request returns: `{"error":"Invalid credentials"}`

## Root Cause
The database query is not finding a user. This happens when:
1. Database hasn't been seeded with user data
2. User doesn't exist with the exact restaurant_id and role

## Solution

### Step 1: Verify Database Setup
```bash
# Check if database exists
psql -l | grep annapoorna

# If not, create it
createdb annapoorna
```

### Step 2: Run Schema
```bash
psql -d annapoorna -f server/db/schema.sql
```

### Step 3: Seed Data
```bash
psql -d annapoorna -f server/db/seed.sql
```

### Step 4: Verify User Exists
```bash
psql -d annapoorna -c "SELECT id, name, role, restaurant_id FROM users WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440000' AND role = 'owner';"
```

## Expected Response

If everything is set up correctly, the login should return:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Anna Owner",
    "role": "owner",
    "restaurant_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "restaurant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Annapoorna",
    "name_tamil": "அன்னபூர்ணா"
  }
}
```

## Quick Test

After seeding, test with:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":"550e8400-e29b-41d4-a716-446655440000","pin":"1234","role":"owner"}'
```

## Common Issues

1. **Database not seeded**: Run seed.sql
2. **Wrong restaurant_id**: Use exact UUID from seed.sql
3. **User not active**: Check `is_active = true` in database
4. **Database connection**: Verify DATABASE_URL in .env

