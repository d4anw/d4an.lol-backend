const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Add CORS headers - MUST be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow requests from your domain and localhost for testing
  const allowedOrigins = [
    'https://d4an.lol',
    'https://www.d4an.lol',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'D4an API running' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
