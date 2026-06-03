"""Shipping calc + order creation + admin management."""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel

from core.auth import get_current_user_optional, require_admin
from core.config import db
from core.mailer import send_order_confirmation
from core.models import (
    Order,
    OrderCreate,
    OrderStatusUpdate,
    ShippingQuote,
)
from core.utils import calc_shipping

router = APIRouter(prefix="/api/orders", tags=["orders"])


class ShippingRequest(BaseModel):
    subtotal: float
    customer_type: str = "retail"


@router.post("/shipping-quote", response_model=ShippingQuote)
async def shipping_quote(payload: ShippingRequest):
    return calc_shipping(payload.subtotal, payload.customer_type)


async def _next_order_number() -> str:
    counter = await db.counters.find_one_and_update(
        {"_id": "order"}, {"$inc": {"seq": 1}}, upsert=True, return_document=True
    )
    if counter is None:
        await db.counters.update_one({"_id": "order"}, {"$set": {"seq": 1000}}, upsert=True)
        return "ECO-1000"
    seq = counter.get("seq", 1000)
    return f"ECO-{seq}"


@router.post("")
async def create_order(
    payload: OrderCreate,
    background: BackgroundTasks,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    # Recalculate prices from DB to prevent tampering
    recomputed_items: List[dict] = []
    subtotal = 0.0
    for item in payload.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=400, detail=f"Producto no encontrado: {item.name}")
        is_pro = payload.customer_type == "professional" and user and user.get("role") in (
            "professional",
            "admin",
        )
        # resolve variation price
        unit_price = product["price_professional"] if is_pro else product["price_retail"]
        variation_sku = item.sku
        if item.variation_name and product.get("variations"):
            for v in product["variations"]:
                if v["name"] == item.variation_name or v["sku"] == item.sku:
                    unit_price = v["price_professional"] if is_pro else v["price_retail"]
                    variation_sku = v["sku"]
                    break
        qty = max(1, int(item.quantity))
        line_total = round(unit_price * qty, 2)
        subtotal += line_total
        recomputed_items.append(
            {
                "product_id": product["id"],
                "sku": variation_sku or product.get("sku", ""),
                "name": product["name"],
                "variation_name": item.variation_name,
                "unit_price": round(unit_price, 2),
                "quantity": qty,
                "image_url": product.get("image_url", ""),
            }
        )
    shipping = calc_shipping(subtotal, payload.customer_type)
    # Click & Collect: no shipping cost, customer pays in advance and picks up in store
    if payload.delivery_method == "pickup":
        shipping = {
            "subtotal": round(subtotal, 2),
            "shipping_cost": 0.0,
            "total": round(subtotal, 2),
            "free_shipping_threshold": shipping.get("free_shipping_threshold", 0.0),
            "remaining_for_free_shipping": 0.0,
            "free_shipping": True,
        }
    order_number = await _next_order_number()
    import uuid

    order_doc = {
        "id": str(uuid.uuid4()),
        "order_number": order_number,
        "email": payload.email.lower(),
        "user_id": user["id"] if user else None,
        "customer_type": payload.customer_type,
        "items": recomputed_items,
        "shipping_address": payload.shipping_address.model_dump(),
        "billing_address": payload.billing_address.model_dump() if payload.billing_address else None,
        "subtotal": round(subtotal, 2),
        "shipping_cost": shipping["shipping_cost"],
        "total": shipping["total"],
        "currency": "EUR",
        "status": "Pendiente",
        "payment_method": payload.payment_method,
        "delivery_method": payload.delivery_method,
        "payment_status": "pending",
        "payment_session_id": None,
        "payment_id": None,
        "notes": payload.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    # Send confirmation email in background (non-blocking, even for B2B bank transfers)
    background.add_task(send_order_confirmation, order_doc)
    return order_doc


@router.get("/by-number/{order_number}")
async def get_by_number(order_number: str):
    order = await db.orders.find_one({"order_number": order_number}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return order


@router.get("/mine")
async def my_orders(user: dict = Depends(get_current_user_optional)):
    if not user:
        return []
    orders = (
        await db.orders.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return orders


# ---------- Admin ----------
@router.get("/admin/list", dependencies=[Depends(require_admin)])
async def admin_list_orders(
    status: Optional[str] = None,
    customer_type: Optional[str] = None,
    limit: int = Query(200, le=1000),
):
    query: dict = {}
    if status:
        query["status"] = status
    if customer_type:
        query["customer_type"] = customer_type
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return orders


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
async def admin_stats():
    total = await db.orders.count_documents({})
    pending = await db.orders.count_documents({"status": "Pendiente"})
    paid = await db.orders.count_documents({"status": "Pagado"})
    shipped = await db.orders.count_documents({"status": "Enviado"})
    completed = await db.orders.count_documents({"status": "Completado"})
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}},
    ]
    cursor = db.orders.aggregate(pipeline)
    revenue = 0.0
    async for r in cursor:
        revenue = r.get("total", 0.0)
    customers = await db.users.count_documents({})
    products_count = await db.products.count_documents({"active": True})
    return {
        "orders_total": total,
        "orders_pending": pending,
        "orders_paid": paid,
        "orders_shipped": shipped,
        "orders_completed": completed,
        "revenue": round(revenue, 2),
        "customers": customers,
        "products": products_count,
    }


@router.get("/admin/{order_id}", dependencies=[Depends(require_admin)])
async def admin_get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return order


@router.patch("/admin/{order_id}/status", dependencies=[Depends(require_admin)])
async def admin_update_status(order_id: str, payload: OrderStatusUpdate):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order
