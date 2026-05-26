const https = require('https');

const key = 'AIzaSyDuolI3lZpAfVX0asflG-oB36MmBzEargE';

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    if (data.models) {
      data.models.forEach(m => {
        if (m.name.includes('flash') || m.name.includes('pro')) {
          console.log(m.name, '|', m.supportedGenerationMethods?.join(', '));
        }
      });
    } else {
      console.log('Error:', body.substring(0, 500));
    }
  });
});
