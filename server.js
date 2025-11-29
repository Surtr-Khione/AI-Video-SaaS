const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`AI Video SaaS server running on http://localhost:${PORT}`);
  console.log(`Access the web interface at http://localhost:${PORT}`);
});
