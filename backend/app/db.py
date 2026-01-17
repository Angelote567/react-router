from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

# Base directory of the current file
BASE_DIR = Path(__file__).resolve().parent
sqlite_file = BASE_DIR / "database.db"

# Create SQLite engine
engine = create_engine(
    f"sqlite:///{sqlite_file}",
    connect_args={"check_same_thread": False},  # Required for SQLite with multiple threads
    echo=True,                                  # Log SQL queries (useful for debugging)
)

def create_db_and_tables():
    # Import models so they are registered in SQLModel metadata
    import app.models.product
    import app.models.order
    import app.models.order_item
    import app.models.user

    # Create database tables if they do not exist
    SQLModel.metadata.create_all(engine)

def get_session():
    # Provide a database session for request handling
    with Session(engine) as session:
        yield session
