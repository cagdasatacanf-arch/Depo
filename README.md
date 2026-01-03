# DEPO - Financial Dashboard

Stock and metal price analysis platform with real-time data visualization.

## Folder Structure

- **backend/** - FastAPI server (Python) with SQLite database
- **frontend/** - React + TypeScript UI with shadcn-ui and Tailwind CSS

## Tech Stack

**Backend:**
- FastAPI + Python
- SQLite database
- yfinance (5 years historical data)
- uvicorn server

**Frontend:**
- React + TypeScript
- Vite build tool
- shadcn-ui components
- Tailwind CSS
- Recharts for data visualization
- React Query for data fetching

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download stock data (first time only):
```bash
python download_stocks.py
```

5. Start the FastAPI server:
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh

# Or directly with Python
python run.py
```

Backend will run on **http://localhost:8000**

API endpoints:
- `GET /api/health` - Health check
- `GET /api/stocks` - List all available stocks
- `GET /api/stocks/{ticker}?days=90` - Get stock data with history
- `GET /api/stocks/{ticker}/latest` - Get latest price

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on **http://localhost:5173**

### Environment Variables

Frontend uses `.env` file for configuration:
```
VITE_API_URL=http://localhost:8000
```

## Available Stocks

Default stocks included:
- GOOGL (Google)
- MSFT (Microsoft)
- AAPL (Apple)
- TSLA (Tesla)
- AMZN (Amazon)

To add more stocks, edit `backend/download_stocks.py` and run it again.

## Development

### Backend Development
```bash
cd backend
python run.py  # Auto-reload enabled
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement enabled
```

### Build for Production

Frontend:
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
DEPO/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── database.py      # Database operations
│   │   └── init.py
│   ├── data/                # Data storage
│   ├── download_stocks.py   # Stock data downloader
│   ├── run.py              # Server startup script
│   ├── requirements.txt    # Python dependencies
│   └── stock_data.db       # SQLite database
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── hooks/         # Custom React hooks
    │   ├── lib/           # API client & utilities
    │   └── pages/         # Page components
    ├── .env               # Environment variables
    └── package.json       # Node dependencies
```

