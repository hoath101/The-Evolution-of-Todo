from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi import Request
from fastapi.responses import JSONResponse
from .database.engine import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    print("Initializing database tables...")
    create_db_and_tables()
    print("Database tables initialized successfully!")
    yield
    # Cleanup on shutdown if needed
    print("Shutting down...")


app = FastAPI(title="Todo AI Chatbot", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Todo AI Chatbot API"}

# Proxy endpoints for Better Auth
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_proxy(path: str, request: Request):
    """
    Proxy endpoint for Better Auth - forwards requests to the Better Auth service
    """
    import os
    from urllib.parse import urljoin

    # Get Better Auth URL from environment
    better_auth_url = os.getenv("BETTER_AUTH_URL", "http://localhost:4000")

    # Construct the target URL
    target_url = urljoin(better_auth_url.rstrip('/') + '/', f'api/auth/{path}')

    # Get the request body if present
    body_bytes = await request.body() if request.method in ["POST", "PUT", "PATCH"] else b""

    # Extract content-type to decide how to handle the body
    content_type = request.headers.get("content-type", "")

    # If content-type is JSON, parse it as JSON; otherwise, pass as bytes
    if 'application/json' in content_type and body_bytes:
        import json
        body = json.loads(body_bytes.decode())
    else:
        body = body_bytes

    # Forward headers (excluding host and content-length which will be auto-set)
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)

    # Make sure origin header is set correctly for Better Auth validation
    headers["origin"] = "http://localhost:3000"
    headers["referer"] = "http://localhost:3000/"

    # Preserve cookies for session management
    headers.pop("cookie", None)  # Will be handled by requests lib automatically

    try:
        # Make the request to Better Auth
        if request.method == "GET":
            response = requests.get(target_url, headers=headers, cookies=request.cookies)
        elif request.method == "POST":
            # If body is a dict (parsed JSON), use json parameter; otherwise use data
            if isinstance(body, dict):
                response = requests.post(target_url, headers=headers, json=body, cookies=request.cookies)
            else:
                response = requests.post(target_url, headers=headers, data=body, cookies=request.cookies)
        elif request.method == "PUT":
            # If body is a dict (parsed JSON), use json parameter; otherwise use data
            if isinstance(body, dict):
                response = requests.put(target_url, headers=headers, json=body, cookies=request.cookies)
            else:
                response = requests.put(target_url, headers=headers, data=body, cookies=request.cookies)
        elif request.method == "DELETE":
            # If body is a dict (parsed JSON), use json parameter; otherwise use data
            if isinstance(body, dict):
                response = requests.delete(target_url, headers=headers, json=body, cookies=request.cookies)
            else:
                response = requests.delete(target_url, headers=headers, data=body, cookies=request.cookies)
        elif request.method == "PATCH":
            # If body is a dict (parsed JSON), use json parameter; otherwise use data
            if isinstance(body, dict):
                response = requests.patch(target_url, headers=headers, json=body, cookies=request.cookies)
            else:
                response = requests.patch(target_url, headers=headers, data=body, cookies=request.cookies)
        else:
            return JSONResponse(
                status_code=405,
                content={"error": f"Method {request.method} not allowed"}
            )

        # Determine content type and handle accordingly
        content_type = response.headers.get('content-type', '')

        if 'application/json' in content_type:
            try:
                content = response.json() if response.content else {}
            except ValueError:
                # If JSON parsing fails, return the raw text
                content = response.text if response.content else {}
        else:
            # For non-JSON responses (like redirects, images, etc.), use text content
            content = response.text if response.content else ""

        # Return the response from Better Auth
        # Copy relevant headers (cookies, etc.) but filter out problematic ones
        response_headers = {}
        for key, value in response.headers.items():
            # Skip certain headers that might conflict
            if key.lower() not in ['content-length', 'transfer-encoding', 'connection', 'content-encoding']:
                response_headers[key] = value

        return JSONResponse(
            status_code=response.status_code,
            content=content,
            headers=response_headers
        )
    except Exception as e:
        print(f"Error communicating with Better Auth: {str(e)}")  # Log for debugging
        return JSONResponse(
            status_code=500,
            content={"error": f"Error communicating with Better Auth: {str(e)}"}
        )

# Import and include API routes
try:
    from .api.v1.chat import router as chat_router
    app.include_router(chat_router, prefix="/api/v1")
except ImportError:
    print("Chat router not yet available")

try:
    from .api.v1.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/v1")
except ImportError:
    print("Auth router not yet available")

try:
    from .api.v1.tasks import router as tasks_router
    app.include_router(tasks_router, prefix="/api/v1")
except ImportError:
    print("Tasks router not yet available")

# Note: This application is designed to be stateless
# All state is persisted in the database and reconstructed per request
# No server-side session storage is used

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)