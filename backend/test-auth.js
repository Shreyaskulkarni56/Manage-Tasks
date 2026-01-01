const fetch = require('node-fetch');

async function testAuth() {
  try {
    // Test registration
    console.log('Testing registration...');
    const registerResponse = await fetch('http://localhost:8080/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);

    if (registerData.token) {
      // Test protected route
      console.log('Testing protected route with token...');
      const meResponse = await fetch('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${registerData.token}`
        }
      });

      const meData = await meResponse.json();
      console.log('Protected route response:', meData);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();