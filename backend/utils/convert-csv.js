const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Simple CSV parser
function parseCSV(csvContent) {
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
  
  return data;
}

// Read and convert
try {
  const csvPath = path.join(__dirname, '../data/sample.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Error: sample.csv not found!');
    console.log('Creating sample.csv...');
    
    const sampleCSV = `id,name,value,date,category
1,Product_A,150.50,2026-01-01,Electronics
2,Product_B,200.75,2026-01-02,Electronics
3,Product_C,99.99,2026-01-03,Fashion
4,Product_D,350.00,2026-01-04,Home
5,Product_E,45.25,2026-01-05,Fashion`;
    
    fs.writeFileSync(csvPath, sampleCSV);
    console.log('✅ Created sample.csv');
  }
  
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const data = parseCSV(csvContent);
  
  const jsonOutput = {
    metadata: {
      source: 'sample.csv',
      total_rows: data.length,
      columns: Object.keys(data[0] || {}),
      conversion_time: new Date().toISOString()
    },
    data: data
  };
  
  // Save JSON
  const outputPath = path.join(__dirname, '../data/converted.json');
  fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
  
  console.log('✅ Conversion complete!');
  console.log(`📦 ${data.length} rows converted`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`📋 Columns: ${Object.keys(data[0] || {}).join(', ')}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
