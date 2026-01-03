const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ LOAD STOCK DATA
let googleStockData = [];
try {
  const googlejson = fs.readFileSync(path.join(__dirname, 'data/GOOGL.json'), 'utf-8');
  googleStockData = JSON.parse(googlejson);
  console.log(`✅ Loaded ${googleStockData.length} Google stock records`);
} catch (error) {
  console.log('⚠️ GOOGL.json not loaded');
}

// ✅ HEALTH
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DEPO Backend Running',
    timestamp: new Date().toISOString()
  });
});

// ✅ GET ALL PRODUCTS
app.get('/api/data', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data/converted.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET STOCK SYMBOLS/OPTIONS
app.get('/api/stocks', (req, res) => {
  const stocks = [
    { symbol: 'GOOGL', name: 'Alphabet Inc', hasHistory: googleStockData.length > 0 },
  ];
  
  try {
    const dataPath = path.join(__dirname, 'data/converted.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const productsData = JSON.parse(rawData);
    
    if (productsData.data && Array.isArray(productsData.data)) {
      productsData.data.forEach((product, index) => {
        stocks.push({
          symbol: `PROD${index}`,
          name: product.name || `Product ${index}`,
          hasHistory: false
        });
      });
    }
  } catch (e) {
    console.log('⚠️ Could not load products');
  }
  
  res.json({ stocks });
});

// ✅ GET SPECIFIC STOCK WITH INDICATORS
app.get('/api/stock/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  if (symbol === 'GOOGL') {
    if (googleStockData.length === 0) {
      return res.status(404).json({ error: 'Google stock data not available' });
    }
    
    const latest = googleStockData[googleStockData.length - 1];
    const oldest = googleStockData[0];
    
    // Calculate 52-week stats
    const last52w = googleStockData.slice(-252); // ~252 trading days in a year
    const prices = last52w.map(d => parseFloat(d.close));
    const high52w = Math.max(...prices);
    const low52w = Math.min(...prices);
    
    // Calculate RSI (14-period)
    const rsi = calculateRSI(last52w);
    
    // Calculate MA (20, 50, 200)
    const ma20 = calculateMA(last52w, 20);
    const ma50 = calculateMA(last52w, 50);
    
    return res.json({
      symbol: 'GOOGL',
      name: 'Alphabet Inc (Google)',
      current_price: parseFloat(latest.close),
      previous_close: parseFloat(googleStockData[googleStockData.length - 2]?.close || latest.close),
      high_52w: high52w,
      low_52w: low52w,
      volume: latest.volume,
      market_cap: 'N/A',
      rsi: rsi.toFixed(2),
      ma20: ma20.toFixed(2),
      ma50: ma50.toFixed(2),
      trend: parseFloat(latest.close) > parseFloat(oldest.close) ? 'UP' : 'DOWN',
      change_percent: (((parseFloat(latest.close) - parseFloat(oldest.close)) / parseFloat(oldest.close)) * 100).toFixed(2),
      history: googleStockData
    });
  }
  
  res.status(404).json({ error: `Stock ${symbol} not found` });
});

// ✅ HELPER: Calculate RSI
function calculateRSI(data, period = 14) {
  const closes = data.map(d => parseFloat(d.close));
  let gains = 0, losses = 0;
  
  for (let i = 1; i < Math.min(period + 1, closes.length); i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

// ✅ HELPER: Calculate Moving Average
function calculateMA(data, period) {
  const closes = data.map(d => parseFloat(d.close));
  const recent = closes.slice(-period);
  return recent.reduce((a, b) => a + b) / recent.length;
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 /api/stocks - List all stocks`);
  console.log(`📈 /api/stock/GOOGL - Google stock with indicators`);
});
