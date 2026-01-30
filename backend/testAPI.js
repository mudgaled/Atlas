const http = require('http');

// Test the products API
const testProductsAPI = () => {
  const options = {
    host: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Success:', response.success);
        console.log('Number of products:', response.data?.products?.length || 0);
        console.log('Sample product:', response.data?.products?.[0]?.name);
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

testProductsAPI();