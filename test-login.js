// Quick test script for login endpoint
// Run with: node test-login.js

const testLogin = async () => {
  const loginData = {
    restaurant_id: "550e8400-e29b-41d4-a716-446655440000",
    pin: "1234",
    role: "owner"
  };

  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.token?.substring(0, 50) + '...');
      console.log('User:', data.user);
      console.log('Restaurant:', data.restaurant);
    } else {
      console.log('\n❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\nMake sure the server is running on port 5001');
  }
};

testLogin();

