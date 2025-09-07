// Simple test of AI endpoint using built-in http
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function testAIEndpoint() {
  console.log('Testing AI endpoint directly...\n');

const postData = JSON.stringify({
  dailyCalories: 2000,
  preference: 'veg'
});

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/suggest',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response body:', data);
      if (res.statusCode === 200) {
        console.log('✅ AI endpoint working!');
      } else {
        console.log('❌ AI endpoint failed with status:', res.statusCode);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection error:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  });

  req.write(postData);
  req.end();
}

testAIEndpoint();
