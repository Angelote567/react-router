from sqlmodel import SQLModel, Field
from typing import Optional

# Base model shared by different Product schemas
class ProductBase(SQLModel):
    title: str                     # Product title
    description: Optional[str] = None  # Optional product description
    price_cents: int               # Price stored in cents to avoid floating point issues
    currency: str                  # Currency code (e.g. "USD", "EUR")
    stock: int                     # Current available stock
    slug: str                      # URL-friendly unique identifier


# Database model
class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


# Schema used when creating a product
class ProductCreate(ProductBase):
    pass
