// Test login functionality
console.log('Testing login...');

const testLogin = async () => {
  try {
    // Simulate the login API call
    const username = 'admin';
    const password = 'admin123';
    
    console.log('Testing with credentials:', { username, password });
    
    // Mock response like our API service
    if (username === 'admin' && password === 'admin123') {
      const mockResponse = {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'administrator'
        },
        expiresIn: 86400
      };
      
      console.log('Login successful:', mockResponse);
      return mockResponse;
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

testLogin();