from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .order_item import OrderItem

# Order database model
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    user_email: str = Field(index=True)  # Email of the user who placed the order

    status: str = Field(default="paid")  # Order status (e.g. paid, pending, cancelled)
    total_cents: int                     # Total order amount in cents
    currency: str = Field(default="USD") # Order currency
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship with order items
    items: List["OrderItem"] = Relationship(back_populates="order")
