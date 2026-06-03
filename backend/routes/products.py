"""Product routes (public + admin)."""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from core.auth import get_current_user_optional, require_admin
from core.config import db
from core.models import Product, ProductCreate, ProductUpdate
from core.utils import slugify

router = APIRouter(prefix="/api/products", tags=["products"])


def _decorate(p: dict, user: Optional[dict]) -> dict:
    """Add `display_price` based on user role."""
    is_pro = user and user.get("role") in ("professional", "admin")
    p.pop("_id", None)
    p["display_price"] = p["price_professional"] if is_pro else p["price_retail"]
    return p


@router.get("")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(100, le=500),
    user: Optional[dict] = Depends(get_current_user_optional),
):
    query: dict = {"active": True}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    items = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return [_decorate(p, user) for p in items]


@router.get("/categories")
async def list_categories():
    cats = await db.products.distinct("category", {"active": True})
    return sorted([c for c in cats if c])


@router.get("/slug/{slug}")
async def get_by_slug(slug: str, user: Optional[dict] = Depends(get_current_user_optional)):
    product = await db.products.find_one({"slug": slug, "active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _decorate(product, user)


@router.get("/{product_id}")
async def get_product(product_id: str, user: Optional[dict] = Depends(get_current_user_optional)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _decorate(product, user)


# ---------- Admin ----------
@router.post("", dependencies=[Depends(require_admin)])
async def create_product(payload: ProductCreate):
    from uuid import uuid4

    now = datetime.now(timezone.utc).isoformat()
    slug = payload.slug or slugify(payload.name)
    # ensure unique slug
    existing = await db.products.find_one({"slug": slug}, {"_id": 0})
    if existing:
        slug = f"{slug}-{uuid4().hex[:5]}"
    doc = payload.model_dump()
    doc["id"] = str(uuid4())
    doc["slug"] = slug
    doc["created_at"] = now
    doc["updated_at"] = now
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.patch("/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(product_id: str, payload: ProductUpdate):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Sin cambios")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.products.update_one({"id": product_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    return doc


@router.delete("/{product_id}", dependencies=[Depends(require_admin)])
async def delete_product(product_id: str):
    await db.products.update_one({"id": product_id}, {"$set": {"active": False}})
    return {"ok": True}
