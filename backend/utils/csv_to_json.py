$content = @"
import pandas as pd
import json
import os
from datetime import datetime

# Paths
csv_file = "data/sample.csv"
output_dir = "data"
output_file = os.path.join(output_dir, "converted.json")

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Read CSV
print("📖 Reading CSV file...")
df = pd.read_csv(csv_file)

# Convert to JSON
json_data = {
    "metadata": {
        "source": csv_file,
        "total_rows": len(df),
        "columns": df.columns.tolist(),
        "conversion_time": datetime.now().isoformat()
    },
    "data": df.to_dict(orient='records')
}

# Save JSON
with open(output_file, 'w') as f:
    json.dump(json_data, f, indent=2)

print(f"✅ Conversion complete!")
print(f"📦 {len(df)} rows converted")
print(f"💾 Saved to: {output_file}")
print(f"📋 Columns: {', '.join(df.columns.tolist())}")
"@

Set-Content -Path "utils/csv_to_json.py" -Value $content
