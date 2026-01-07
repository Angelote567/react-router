from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.dependencies import SessionDep
from app.models.product import Product, ProductCreate

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[Product])
def list_products(session: SessionDep):
    return session.exec(select(Product)).all()

@router.post("/", response_model=Product, status_code=201)
def create_product(product_in: ProductCreate, session: SessionDep):
    product = Product.model_validate(product_in)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int, session: SessionDep):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404)
    return product

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, product_in: ProductCreate, session: SessionDep):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404)

    for k, v in product_in.model_dump().items():
        setattr(product, k, v)

    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, session: SessionDep):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404)

    session.delete(product)
    session.commit()
