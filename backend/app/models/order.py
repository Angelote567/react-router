from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .order_item import OrderItem

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    user_email: str = Field(index=True)

    status: str = Field(default="paid")
    total_cents: int
    currency: str = Field(default="USD")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["OrderItem"] = Relationship(back_populates="order")
