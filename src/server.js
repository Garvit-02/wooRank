const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/analyze', analyzeRouter);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// API route (business logic to be added later)
app.post('/api/analyze', (req, res) => {
  res.json({ message: 'Analysis endpoint - implementation pending' });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});