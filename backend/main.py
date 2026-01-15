from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data import get_data_info, get_stats, get_top_pickup_zones, get_top_dropoff_zones, get_hourly_trips, get_daily_trips, get_payment_breakdown, get_heatmap_data, get_tip_stats, get_tip_by_borough, get_zone_pickups, init_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: pre-load and cache data
    print("Initializing data cache...")
    init_data()
    print("Data cache ready!")
    yield
    # Shutdown: nothing to clean up


app = FastAPI(title="NYC Taxi Analytics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "NYC Taxi Analytics API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/data/info")
def data_info():
    """Get basic information about the taxi dataset."""
    return get_data_info()


@app.get("/stats")
def stats():
    """Get summary statistics."""
    return get_stats()


@app.get("/top-pickup-zones")
def top_pickup_zones():
    """Get top 10 pickup zones by trip count."""
    return get_top_pickup_zones()


@app.get("/top-dropoff-zones")
def top_dropoff_zones():
    """Get top 10 dropoff zones by trip count."""
    return get_top_dropoff_zones()


@app.get("/hourly-trips")
def hourly_trips():
    """Get trip counts by hour of day."""
    return get_hourly_trips()


@app.get("/daily-trips")
def daily_trips():
    """Get trip counts by day of week."""
    return get_daily_trips()


@app.get("/payment-breakdown")
def payment_breakdown():
    """Get trip counts by payment type."""
    return get_payment_breakdown()


@app.get("/heatmap")
def heatmap():
    """Get trip counts by hour and day of week for heatmap."""
    return get_heatmap_data()


@app.get("/tip-stats")
def tip_stats():
    """Get average tip percentage for credit card payments."""
    return get_tip_stats()


@app.get("/tip-by-borough")
def tip_by_borough():
    """Get average tip percentage by borough."""
    return get_tip_by_borough()


@app.get("/zone-pickups")
def zone_pickups():
    """Get pickup counts for all zones (for choropleth map)."""
    return get_zone_pickups()
