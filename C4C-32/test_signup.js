const http = require('http');

const body = JSON.stringify({
  email: 'freshseller99@karigar.com',
  password: '123456',
  full_name: 'Fresh Seller',
  role: 'seller',
  phone_number: '9876543210',
  state: 'Madhya Pradesh',
  district: 'Bhopal'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    const parsed = JSON.parse(data);
    console.log('USER:', JSON.stringify(parsed.user, null, 2));
    console.log('HAS full_name:', !!parsed.user?.full_name);
  });
});

req.on('error', err => console.error('ERROR:', err.message));
req.write(body);
req.end();
