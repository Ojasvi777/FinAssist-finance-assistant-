import os
from backend.repositories.base import BaseRepository

def get_repository() -> BaseRepository:
    """Dynamically select and return the active database repository implementation.
    
    If DATABASE_URL is defined and references a postgres database, we use the
    PrismaRepository (PostgreSQL). Otherwise, we fall back to the SQLiteRepository.
    """
    db_url = os.environ.get("DATABASE_URL")
    if db_url and (db_url.startswith("postgresql") or db_url.startswith("postgres")):
        try:
            from backend.repositories.prisma import PrismaRepository
            return PrismaRepository()
        except ImportError:
            print("[Warning] Prisma client modules could not be imported. Make sure to generate the client. Falling back to SQLite.")
            
    from backend.repositories.sqlite import SQLiteRepository
    return SQLiteRepository()
