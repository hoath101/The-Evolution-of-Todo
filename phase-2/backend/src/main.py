
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import create_db_and_tables
from .api import router as api_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Todo App Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.lifespan("startup")
def on_startup():
    logger.info("Starting up the application and initializing database tables")
    create_db_and_tables()

@app.middleware("http")
async def log_auth_failures(request, call_next):
    response = await call_next(request)

    # Log authentication and authorization failures
    if response.status_code in [401, 403]:
        logger.warning(f"Authentication/Authorization failure: {request.method} {request.url} - Status: {response.status_code}")

    return response

@app.get("/")
def root():
    return {
        "message": "Todo App Backend API",
        "version": "0.1.0",
        "status": "running",
        "documentation": "Visit /docs for API documentation",
        "health": "/health endpoint"
    }

@app.get("/help")
def help():
    return {
        "message": "Todo App Backend API Help",
        "available_endpoints": {
            "/health": "Health check",
            "/docs": "Interactive API documentation",
            "/redoc": "Alternative API documentation",
            "/api/{user_id}/tasks": "Task management endpoints"
        },
        "info": "For detailed API documentation, visit /docs"
    }

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
