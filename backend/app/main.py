from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import create_db_and_tables
from app.routes.products import router as products_router
from app.routes.checkout import router as checkout_router
from app.routes.orders import router as orders_router
from app.routes.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(checkout_router)
app.include_router(orders_router)
