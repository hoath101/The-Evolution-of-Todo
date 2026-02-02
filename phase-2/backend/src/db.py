
from sqlmodel import create_engine, Session, SQLModel
from .config import settings

# In production with Postgres, we might need to replace 'postgres://' with 'postgresql://' if it comes from certain providers
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Add SSL configuration for Neon database connection
if "neon.tech" in database_url:
    # For Neon, we need to ensure SSL is properly configured
    if "?" in database_url:
        database_url += "&sslmode=require"
    else:
        database_url += "?sslmode=require"

engine = create_engine(database_url, echo=True, pool_pre_ping=True, pool_recycle=300)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
