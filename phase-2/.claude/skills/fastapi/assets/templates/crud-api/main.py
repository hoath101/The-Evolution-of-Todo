# Complete CRUD API Template for FastAPI
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, crud, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="CRUD API",
    description="Complete CRUD API with FastAPI and SQLAlchemy",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Create
@app.post("/items", response_model=schemas.Item, status_code=status.HTTP_201_CREATED)
def create_item(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    return crud.create_item(db=db, item=item)

# Read all
@app.get("/items", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

# Read one
@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(database.get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

# Update
@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(database.get_db)):
    db_item = crud.update_item(db, item_id=item_id, item=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

# Delete
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
