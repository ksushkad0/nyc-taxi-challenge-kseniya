import duckdb

DATA_URL = "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet"

# Global connection for efficient reuse
_conn = None


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
