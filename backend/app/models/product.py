from sqlmodel import SQLModel, Field
from typing import Optional

class ProductBase(SQLModel):
    title: str
    description: Optional[str] = None
    price_cents: int
    currency: str
    stock: int
    slug: str

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ProductCreate(ProductBase):
    pass
