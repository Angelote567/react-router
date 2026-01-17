from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import SessionDep
from app.models.product import Product

# Router for checkout-related endpoints
router = APIRouter(prefix="/checkout", tags=["checkout"])


class Item(BaseModel):
    # Single cart item
    product_id: int
    quantity: int


class Cart(BaseModel):
    # Shopping cart payload
    items: list[Item]


@router.post("/validate")
def validate_cart(cart: Cart, session: SessionDep):
    # Validate cart items against current product stock
    errors = []

    for item in cart.items:
        product = session.get(Product, item.product_id)

        if not product:
            errors.append({"product_id": item.product_id, "reason": "NOT_FOUND"})
        elif item.quantity > product.stock:
            errors.append({
                "product_id": item.product_id,
                "reason": "OUT_OF_STOCK",
                "stock": product.stock,
                "requested": item.quantity,
            })

    if errors:
        # Return all validation errors at once
        raise HTTPException(status_code=400, detail={"errors": errors})

    return {"ok": True}
