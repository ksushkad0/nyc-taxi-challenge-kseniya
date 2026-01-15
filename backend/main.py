from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data import get_data_info, get_stats, get_top_pickup_zones

app = FastAPI(title="NYC Taxi Analytics API")

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
