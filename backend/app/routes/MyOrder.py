from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.auth import get_current_user
from app.models import Product, Order, OrderItem, User
from datetime import datetime

# Router for order-related endpoints
router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", status_code=201)
def create_order(
    payload: dict,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    # Example payload: { "items": [ {"product_id": 1, "quantity": 2}, etc ] }
    items = payload.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="Empty cart")

    # 1) Load products and validate stock
    product_ids = [i["product_id"] for i in items]
    products = session.exec(select(Product).where(Product.id.in_(product_ids))).all()
    products_map = {p.id: p for p in products}

    # Validate existence, quantity, stock and currency
    total_cents = 0
    currency = None

    for it in items:
        p = products_map.get(it["product_id"])
        if not p:
            raise HTTPException(
                status_code=404,
                detail=f"Product {it['product_id']} does not exist",
            )
        qty = int(it["quantity"])
        if qty < 1:
            raise HTTPException(status_code=400, detail="Invalid quantity")
        if p.stock < qty:
            raise HTTPException(
                status_code=409,
                detail=f"Not enough stock for {p.title}",
            )

        currency = currency or p.currency
        if p.currency != currency:
            raise HTTPException(
                status_code=400,
                detail="Mixed currencies are not supported",
            )
        total_cents += p.price_cents * qty

    # 2) Create order
    order = Order(
        user_id=user.id,
        status="paid",  # or "pending" if real payment is added later
        total_cents=total_cents,
        currency=currency or "USD",
        created_at=datetime.utcnow(),
    )
    session.add(order)
    session.flush()  # get order.id without committing yet

    # 3) Create order items + 4) decrease product stock
    for it in items:
        p = products_map[it["product_id"]]
        qty = int(it["quantity"])

        oi = OrderItem(
            order_id=order.id,
            product_id=p.id,
            unit_price_cents=p.price_cents,
            quantity=qty,
        )
        session.add(oi)

        p.stock -= qty
        session.add(p)

    session.commit()
    session.refresh(order)
    return {"id": order.id}
