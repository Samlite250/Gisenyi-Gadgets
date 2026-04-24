const https = require('https');

const url = 'https://fdsaemjngaamvgjlooyh.supabase.co/rest/v1/products?select=*&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2FlbWpuZ2FhbXZnamxvb3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3NjcsImV4cCI6MjA5MjU1ODc2N30.zFgCoZs4R_gT5cGiQA2WLn9fUuzIcogUkWOy3A1WtwI';

const options = {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
};

console.log('Fetching products from Supabase via HTTPS...');
https.get(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response body:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
