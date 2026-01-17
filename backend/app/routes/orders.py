from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from datetime import datetime
from typing import Optional, List

from app.db import get_session
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem

# Router for order-related endpoints
router = APIRouter(prefix="/orders", tags=["orders"])


def require_user_email(x_user_email: Optional[str]) -> str:
    # Validate presence of X-User-Email header
    if not x_user_email or not x_user_email.strip():
        raise HTTPException(status_code=401, detail="Missing X-User-Email header")
    return x_user_email.strip()


@router.post("/", status_code=201)
def create_order(
    payload: dict,
    session: Session = Depends(get_session),
    x_user_email: Optional[str] = Header(default=None, convert_underscores=False, alias="X-User-Email"),
):
    """
    Create an order for the user identified by the X-User-Email header.
    Example payload: { "items": [ {"product_id": 1, "quantity": 2}, ... ] }
    """
    user_email = require_user_email(x_user_email)

    items = payload.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="Empty cart")

    product_ids = [int(i["product_id"]) for i in items]
    products = session.exec(select(Product).where(Product.id.in_(product_ids))).all()
    products_map = {p.id: p for p in products}

    total_cents = 0
    currency = None

    for it in items:
        pid = int(it["product_id"])
        qty = int(it["quantity"])

        p = products_map.get(pid)
        if not p:
            raise HTTPException(status_code=404, detail=f"Product {pid} does not exist")
        if qty < 1:
            raise HTTPException(status_code=400, detail="Invalid quantity")
        if p.stock < qty:
            raise HTTPException(status_code=409, detail=f"Not enough stock for {p.title}")

        currency = currency or p.currency
        if p.currency != currency:
            raise HTTPException(status_code=400, detail="Mixed currencies are not supported")

        total_cents += p.price_cents * qty

    order = Order(
        user_email=user_email,
        status="paid",  # or "pending" if Stripe is added later
        total_cents=total_cents,
        currency=currency or "EUR",
        created_at=datetime.utcnow(),
    )
    session.add(order)
    session.flush()  # needed to get order.id

    for it in items:
        pid = int(it["product_id"])
        qty = int(it["quantity"])
        p = products_map[pid]

        oi = OrderItem(
            order_id=order.id,
            product_id=p.id,
            unit_price_cents=p.price_cents,
            quantity=qty,
        )
        session.add(oi)

        # Reduce product stock
        p.stock -= qty
        session.add(p)

    session.commit()
    session.refresh(order)
    return {"id": order.id}


@router.get("/my")
def my_orders(
    session: Session = Depends(get_session),
    x_user_email: Optional[str] = Header(default=None, convert_underscores=False, alias="X-User-Email"),
):
    """
    Return all orders for the current user (from X-User-Email header),
    including items, ordered from newest to oldest.
    """
    user_email = require_user_email(x_user_email)

    orders = session.exec(
        select(Order).where(Order.user_email == user_email).order_by(Order.created_at.desc())
    ).all()

    if not orders:
        return []

    order_ids = [o.id for o in orders]
    items = session.exec(select(OrderItem).where(OrderItem.order_id.in_(order_ids))).all()

    # Load all related products in a single query
    product_ids = list({it.product_id for it in items})
    products = session.exec(select(Product).where(Product.id.in_(product_ids))).all()
    products_map = {p.id: p for p in products}

    items_by_order = {}
    for it in items:
        p = products_map.get(it.product_id)
        items_by_order.setdefault(it.order_id, []).append(
            {
                "product_id": it.product_id,
                "quantity": it.quantity,
                "unit_price_cents": it.unit_price_cents,
                "title": p.title if p else None,
            }
        )

    # Exact response format expected by MyOrder.tsx
    return [
        {
            "id": o.id,
            "user_email": o.user_email,
            "status": o.status,
            "total_cents": o.total_cents,
            "currency": o.currency,
            "created_at": o.created_at.isoformat(),
            "items": items_by_order.get(o.id, []),
        }
        for o in orders
    ]
