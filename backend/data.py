from pathlib import Path
from typing import Optional

import duckdb

# Use local data files
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_PATH = DATA_DIR / "yellow_tripdata_2024-01.parquet"
ZONE_LOOKUP_PATH = DATA_DIR / "taxi_zone_lookup.csv"

# Global connection for efficient reuse
_conn = None
_zone_lookup = None


def get_connection() -> duckdb.DuckDBPyConnection:
    """Get or create a DuckDB connection."""
    global _conn
    if _conn is None:
        _conn = duckdb.connect()
    return _conn


def get_data_info() -> dict:
    """Get basic information about the dataset."""
    conn = get_connection()

    # Get row count
    row_count = conn.execute(
        f"SELECT COUNT(*) FROM '{DATA_PATH}'"
    ).fetchone()[0]

    # Get column info
    columns = conn.execute(
        f"DESCRIBE SELECT * FROM '{DATA_PATH}'"
    ).fetchall()

    column_info = [
        {"name": col[0], "type": str(col[1])}
        for col in columns
    ]

    return {
        "row_count": row_count,
        "columns": column_info,
        "source": DATA_PATH
    }


def query(sql: str) -> list[dict]:
    """Execute a SQL query against the taxi data."""
    conn = get_connection()
    result = conn.execute(sql).fetchdf()
    return result.to_dict(orient="records")


def get_zone_lookup() -> dict[int, dict]:
    """Load and cache zone lookup data."""
    global _zone_lookup
    if _zone_lookup is None:
        conn = get_connection()
        zones = conn.execute(f"SELECT * FROM '{ZONE_LOOKUP_PATH}'").fetchdf()
        _zone_lookup = {
            int(row["LocationID"]): {
                "borough": row["Borough"],
                "zone": row["Zone"],
                "service_zone": row["service_zone"]
            }
            for _, row in zones.iterrows()
        }
    return _zone_lookup


def get_zone(location_id: int) -> Optional[dict]:
    """Map a LocationID to its Borough and Zone name."""
    lookup = get_zone_lookup()
    return lookup.get(location_id)


def get_stats() -> dict:
    """Get summary statistics for the dataset."""
    conn = get_connection()
    result = conn.execute(f"""
        SELECT
            COUNT(*) as total_trips,
            AVG(total_amount) as avg_fare,
            AVG(CASE WHEN trip_distance > 0 THEN trip_distance END) as avg_distance
        FROM '{DATA_PATH}'
    """).fetchone()
    return {
        "total_trips": result[0],
        "avg_fare": round(result[1], 2),
        "avg_distance": round(result[2], 2)
    }


def get_top_pickup_zones(limit: int = 10) -> list[dict]:
    """Get top pickup zones by trip count."""
    conn = get_connection()
    result = conn.execute(f"""
        SELECT
            t.PULocationID as location_id,
            z.Zone as zone_name,
            z.Borough as borough,
            COUNT(*) as trip_count
        FROM '{DATA_PATH}' t
        JOIN '{ZONE_LOOKUP_PATH}' z ON t.PULocationID = z.LocationID
        GROUP BY t.PULocationID, z.Zone, z.Borough
        ORDER BY trip_count DESC
        LIMIT {limit}
    """).fetchdf()
    return result.to_dict(orient="records")
