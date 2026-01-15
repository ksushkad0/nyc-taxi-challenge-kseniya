from typing import Optional

import duckdb

DATA_URL = "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet"
ZONE_LOOKUP_URL = "https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv"

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
        f"SELECT COUNT(*) FROM '{DATA_URL}'"
    ).fetchone()[0]

    # Get column info
    columns = conn.execute(
        f"DESCRIBE SELECT * FROM '{DATA_URL}'"
    ).fetchall()

    column_info = [
        {"name": col[0], "type": str(col[1])}
        for col in columns
    ]

    return {
        "row_count": row_count,
        "columns": column_info,
        "source": DATA_URL
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
        zones = conn.execute(f"SELECT * FROM '{ZONE_LOOKUP_URL}'").fetchdf()
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
            AVG(total_amount) as avg_fare
        FROM '{DATA_URL}'
    """).fetchone()
    return {
        "total_trips": result[0],
        "avg_fare": round(result[1], 2)
    }
