# NYC Taxi Analytics Challenge

**Time Limit: 2 hours** | **Goal: Close as many issues as possible**

## The Goal

Build a **taxi trip analytics dashboard** using NYC yellow cab data.

Your finished product should:

1. Load and process NYC taxi trip data (parquet format)
2. Display key statistics (total trips, average fare, average distance)
3. Visualize trip patterns (by hour, day, zone)
4. Show busiest pickup/dropoff zones
5. Map visualization with zone boundaries
6. Filter by date, time, borough
7. Be deployed and accessible via a public URL

**How you build it is entirely up to you.** Choose your own stack, architecture, and approach.

## The Data

NYC TLC provides free trip record data in parquet format:

```python
# Quick start (Python)
import pandas as pd
df = pd.read_parquet("https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet")
```

See [DATA.md](./DATA.md) for detailed field documentation.

## Rules

1. **Fork this repo** - work on your own copy
2. **Close issues by implementing them** - push your code, then close the issue
3. **Be honest** - only close an issue when the feature actually works
4. **Any stack is allowed** - React, Vue, Python, Node, Go... your choice
5. **You may use AI tools** - but you still need to understand and verify your code

## Scoring

Each closed issue = points (see issue labels):

- `1-point` - Quick wins
- `2-points` - Core features
- `3-points` - Advanced features
- `5-points` - Bonus challenges

## Azure Credentials

You have access to Azure for deployment. Credentials will be provided separately.

Good luck!

---

## Project Setup

### Tech Stack
- **Backend**: Python 3.11+ / FastAPI / DuckDB
- **Frontend**: React 18 / TypeScript / Vite / Recharts / Leaflet
- **Data**: NYC Yellow Taxi Trip Data (Parquet format)

### Folder Structure
```
├── backend/
│   ├── main.py           # FastAPI application & API routes
│   ├── data.py           # DuckDB queries & data caching
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main dashboard component
│   │   ├── App.css       # Dashboard styles
│   │   └── ZoneMap.tsx   # Choropleth map component
│   └── package.json      # Node dependencies
├── data/                 # Local data files (gitignored)
│   ├── yellow_tripdata_2024-01.parquet
│   └── taxi_zone_lookup.csv
├── venv/                 # Python virtual environment
└── DATA.md               # Data documentation
```

### Prerequisites

1. **Download the data files** and place them in the `data/` folder:
   - [yellow_tripdata_2024-01.parquet](https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet)
   - [taxi_zone_lookup.csv](https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv)

### Quick Start

**1. Start the Backend**
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies (first time only)
pip install -r backend/requirements.txt

# Run the API server
cd backend
uvicorn main:app --reload --port 8000
```
API available at: http://localhost:8000

**2. Start the Frontend**
```bash
# Install dependencies (first time only)
cd frontend
npm install

# Run development server
npm run dev
```
Dashboard available at: http://localhost:5173

---

## Implemented Features

### Dashboard Statistics
- **Total Trips** - Count of all taxi trips
- **Average Fare** - Mean fare amount
- **Average Distance** - Mean trip distance in miles
- **Average Tip %** - Mean tip as percentage of fare (credit card only)

### Visualizations

| Feature | Description |
|---------|-------------|
| **Trips by Hour** | Bar chart showing trip volume across 24 hours |
| **Trips by Day** | Bar chart with weekday/weekend color distinction |
| **Payment Methods** | Pie chart showing credit card vs cash breakdown |
| **Tip by Borough** | Horizontal bar chart comparing tip % across boroughs |
| **Pickup Heatmap** | Hour x Day grid showing pickup patterns |
| **Zone Choropleth** | Interactive map with zones colored by pickup volume |
| **Top Pickup Zones** | Table of 10 busiest pickup locations |
| **Top Dropoff Zones** | Table of 10 busiest dropoff locations |

### Technical Features
- **DuckDB Integration** - Fast SQL queries on Parquet data
- **Data Caching** - All queries pre-computed on server startup
- **Responsive Design** - Works on desktop and tablet
- **Interactive Tooltips** - Hover for detailed information

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `GET /stats` | Summary statistics (trips, fare, distance) |
| `GET /top-pickup-zones` | Top 10 pickup zones by trip count |
| `GET /top-dropoff-zones` | Top 10 dropoff zones by trip count |
| `GET /hourly-trips` | Trip counts by hour (0-23) |
| `GET /daily-trips` | Trip counts by day of week |
| `GET /payment-breakdown` | Trip counts by payment type |
| `GET /heatmap` | Trip counts by hour and day for heatmap |
| `GET /tip-stats` | Average tip percentage (credit card only) |
| `GET /tip-by-borough` | Average tip percentage by borough |
| `GET /zone-pickups` | All zones with pickup counts for map |

---

## Development

### Build for Production
```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend (run with production server)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Environment
- Python 3.11+
- Node.js 18+
- ~3M taxi trips in January 2024 dataset
