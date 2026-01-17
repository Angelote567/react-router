from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import create_db_and_tables
from app.routes.products import router as products_router
from app.routes.checkout import router as checkout_router
from app.routes.orders import router as orders_router
from app.routes.auth import router as auth_router

# Create the FastAPI application instance
app = FastAPI(
    title="E-commerce API",          # API title shown in Swagger UI
    version="1.0.0",                 # API version
    docs_url="/docs",                # Swagger documentation URL
    redoc_url="/redoc",              # ReDoc documentation URL
    openapi_url="/openapi.json",     # OpenAPI schema URL
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],             # Allow requests from any origin
    allow_credentials=False,         # Credentials not allowed
    allow_methods=["*"],             # Allow all HTTP methods
    allow_headers=["*"],             # Allow all headers
)

# Run on application startup
@app.on_event("startup")
def on_startup():
    # Create database and tables if they do not exist
    create_db_and_tables()

# Simple health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}

# Register API routers
app.include_router(auth_router)      # Authentication routes
app.include_router(products_router)  # Product catalog routes
app.include_router(checkout_router)  # Cart validation / checkout routes
app.include_router(orders_router)    # Orders and order history routes
