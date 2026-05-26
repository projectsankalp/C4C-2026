const http = require('http');

const data = JSON.stringify({ transcript: 'hey', page: '/collections', language: 'English (India)' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/gemini/chat',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
