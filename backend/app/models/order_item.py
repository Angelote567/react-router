from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .order import Order
    from .product import Product

class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    order_id: int = Field(foreign_key="order.id", index=True)
    product_id: int = Field(foreign_key="product.id", index=True)

    unit_price_cents: int
    quantity: int

    order: Optional["Order"] = Relationship(back_populates="items")
    product: Optional["Product"] = Relationship()
