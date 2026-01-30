const http = require('http');

// Test a specific order API
const testOrderAPI = () => {
  const options = {
    host: 'localhost',
    port: 5000,
    path: '/api/orders/68d3fdbaf17cdefed686139b', // Using the order ID we know exists
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE' // This will likely fail without a valid token
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Success:', response.success);
        console.log('Response message:', response.message);
        console.log('Order data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
};

// We need to test with authentication, so let's also try a different approach using axios or similar
// For now, let's create a simple script that can run with a valid token when needed
console.log("This script would test the order API, but requires authentication");
console.log("You need a valid JWT token to access order details");