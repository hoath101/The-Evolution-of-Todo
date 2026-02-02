import asyncpg
import asyncio
import os
from urllib.parse import urlparse

DATABASE_URL = os.getenv("DATABASE_URL")

async def test():
    conn = await asyncpg.connect(
        DATABASE_URL,
        ssl="require"  # This tells asyncpg to use SSL
    )
    print(await conn.fetch("SELECT 1"))
    await conn.close()

asyncio.run(test())
