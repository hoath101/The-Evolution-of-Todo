"""
Authentication API endpoints for Todo AI Chatbot
These endpoints are proxy endpoints that forward requests to Better Auth.
All authentication is handled by Better Auth exclusively.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

# This file contains placeholder endpoints
# All authentication is handled by the auth proxy in main.py
# Better Auth handles all user management and JWT generation

@router.get("/health")
def auth_health():
    """
    Health check for auth endpoints.
    All actual auth functionality is handled by Better Auth via proxy.
    """
    return {"status": "auth proxy active", "message": "Forwarding to Better Auth"}