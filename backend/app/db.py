from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sqlite_file = BASE_DIR / "database.db"

engine = create_engine(
    f"sqlite:///{sqlite_file}",
    connect_args={"check_same_thread": False},
    echo=True,
)

def create_db_and_tables():
    import app.models.product
    import app.models.order
    import app.models.order_item
    import app.models.user

    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
