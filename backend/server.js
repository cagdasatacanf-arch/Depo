const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS for frontend access
app.use(cors());

// Serve static files
app.use(express.static('public'));

// 🔥 ADD THIS ENDPOINT 🔥
app.get('/api/data', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data/converted.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);
    
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error.message);
    res.status(500).json({ 
      error: 'Failed to load data',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/data`);
});
