const fs = require('fs');
const path = require('path');

// Read CSV
const csvPath = path.join(__dirname, '../data/google_historical_data_2020_2025.csv');
const outputPath = path.join(__dirname, '../data/GOOGL.json');

console.log('📖 Reading CSV...');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());

const data = lines.slice(1).map(line => {
  const values = line.split(',').map(v => v.trim());
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });
  return obj;
});

// Save as JSON
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`✅ Converted ${data.length} records`);
console.log(`💾 Saved to: ${outputPath}`);
console.log(`\nFirst record:`, data[0]);
