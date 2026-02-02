# API Development Reference

Advanced API development patterns, middleware, and features in FastAPI.

## Table of Contents

- Path Parameters & Query Parameters
- Request Body & Forms
- Response Models
- Middleware
- Background Tasks
- WebSockets
- File Uploads
- CORS
- Testing

## Path Parameters & Query Parameters

### Path Parameters

```python
from enum import Enum
from fastapi import FastAPI, Path

app = FastAPI()

# Basic path parameter
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# Path parameter with validation
@app.get("/users/{user_id}")
async def read_user(
    user_id: int = Path(..., title="The ID of the user", ge=1, le=1000)
):
    return {"user_id": user_id}

# Enum path parameter
class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}
    return {"model_name": model_name}

# File path parameter
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}
```

### Query Parameters

```python
from fastapi import Query

# Optional query parameter
@app.get("/items")
async def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# Required query parameter
@app.get("/items")
async def read_items(q: str):
    return {"q": q}

# Query parameter with validation
@app.get("/items")
async def read_items(
    q: str | None = Query(
        None,
        min_length=3,
        max_length=50,
        regex="^fixedquery$"
    )
):
    return {"q": q}

# Multiple query parameters
@app.get("/items")
async def read_items(q: list[str] = Query(None)):
    return {"q": q}

# With metadata
@app.get("/items")
async def read_items(
    q: str | None = Query(
        None,
        title="Query string",
        description="Query string for the items to search",
        min_length=3,
    )
):
    return {"q": q}
```

## Request Body & Forms

### Request Body

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(..., example="Foo")
    description: str | None = Field(None, example="A very nice Item")
    price: float = Field(..., gt=0, example=35.4)
    tax: float | None = Field(None, example=3.2)

@app.post("/items")
async def create_item(item: Item):
    return item

# Multiple body parameters
class User(BaseModel):
    username: str
    full_name: str | None = None

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item, user: User):
    return {"item_id": item_id, "item": item, "user": user}

# Body with extra parameter
from fastapi import Body

@app.put("/items/{item_id}")
async def update_item(
    item_id: int,
    item: Item,
    importance: int = Body(...)
):
    return {"item_id": item_id, "item": item, "importance": importance}
```

### Form Data

```python
from fastapi import Form

@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    return {"username": username}

# Form with file
from fastapi import File, UploadFile

@app.post("/files")
async def create_file(
    file: bytes = File(...),
    fileb: UploadFile = File(...),
    token: str = Form(...)
):
    return {
        "file_size": len(file),
        "token": token,
        "fileb_content_type": fileb.content_type,
    }
```

## Response Models

### Response Model

```python
from pydantic import BaseModel, EmailStr

class UserIn(BaseModel):
    username: str
    password: str
    email: EmailStr
    full_name: str | None = None

class UserOut(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None

@app.post("/user", response_model=UserOut)
async def create_user(user: UserIn):
    return user  # Password won't be in response
```

### Multiple Response Models

```python
from typing import Union

class BaseItem(BaseModel):
    description: str
    type: str

class CarItem(BaseItem):
    type: str = "car"

class PlaneItem(BaseItem):
    type: str = "plane"
    size: int

@app.get("/items/{item_id}", response_model=Union[PlaneItem, CarItem])
async def read_item(item_id: str):
    return items[item_id]
```

### Response Status Code

```python
from fastapi import status

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str):
    return None
```

## Middleware

### Custom Middleware

```python
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### CORS Middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Trusted Host Middleware

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com"]
)
```

### GZip Middleware

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

## Background Tasks

```python
from fastapi import BackgroundTasks

def write_log(message: str):
    with open("log.txt", mode="a") as log:
        log.write(message)

def send_email(email: str, message: str):
    # Send email logic
    pass

@app.post("/send-notification/{email}")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(write_log, f"Notification sent to {email}")
    background_tasks.add_task(send_email, email, "Message")
    return {"message": "Notification sent in the background"}

# With dependencies
@app.post("/items/{item_id}")
async def create_item(
    item_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Create item
    background_tasks.add_task(update_cache, item_id)
    return {"item_id": item_id}
```

## WebSockets

```python
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")

# With connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client #{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")
```

## File Uploads

```python
from fastapi import File, UploadFile
import shutil

@app.post("/uploadfile")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}

# Multiple files
@app.post("/uploadfiles")
async def create_upload_files(files: list[UploadFile]):
    return {"filenames": [file.filename for file in files]}

# Save file
@app.post("/uploadfile")
async def create_upload_file(file: UploadFile):
    with open(f"uploads/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename}

# With form data
@app.post("/files")
async def create_file(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...)
):
    return {
        "filename": file.filename,
        "name": name,
        "description": description,
    }
```

## CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

# Development - Allow all
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production - Specific origins
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://example.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Testing

```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item():
    response = client.post(
        "/items",
        json={"name": "Foo", "price": 42.0}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Foo"

# Test with authentication
def test_protected_route():
    response = client.get(
        "/protected",
        headers={"Authorization": "Bearer token123"}
    )
    assert response.status_code == 200

# Test with database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def test_create_user():
    response = client.post(
        "/users",
        json={"email": "test@example.com", "password": "password"}
    )
    assert response.status_code == 201
```

## API Versioning

```python
from fastapi import APIRouter

# Version 1
v1_router = APIRouter(prefix="/api/v1")

@v1_router.get("/items")
async def read_items_v1():
    return [{"name": "Item 1"}]

# Version 2
v2_router = APIRouter(prefix="/api/v2")

@v2_router.get("/items")
async def read_items_v2():
    return [{"name": "Item 1", "description": "A description"}]

app.include_router(v1_router)
app.include_router(v2_router)
```

## Request Validation

```python
from pydantic import BaseModel, validator, Field

class Item(BaseModel):
    name: str
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    quantity: int = Field(..., ge=1)

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name must not be empty')
        return v

    @validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v
```

## Best Practices

1. **Use routers** to organize endpoints by domain
2. **Async operations** for I/O-bound tasks
3. **Dependency injection** for shared logic
4. **Response models** to control output
5. **Background tasks** for non-blocking operations
6. **Middleware** for cross-cutting concerns
7. **Testing** with TestClient
8. **Type hints** for validation and docs
