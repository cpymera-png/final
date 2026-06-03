"""Pydantic data models for Ecoandes."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional, Literal
import uuid

from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- helpers ----------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


# ---------- User ----------
UserRole = Literal["retail", "professional", "admin"]


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: Literal["retail", "professional"] = "retail"
    company: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    company: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    approved: bool = True
    created_at: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    approved: Optional[bool] = None


# ---------- Product ----------
class ProductVariation(BaseModel):
    sku: str
    name: str  # e.g. "500 g", "1 kg"
    price_retail: float  # PVP (B2C)
    price_professional: float  # B2B
    stock: int = 0


class ProductBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sku: str
    slug: str
    name: str
    category: str = "General"
    description: str = ""
    short_description: str = ""
    price_retail: float
    price_professional: float
    stock: int = 0
    image_url: str = ""
    gallery: List[str] = Field(default_factory=list)
    variations: List[ProductVariation] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    featured: bool = False
    active: bool = True


class Product(ProductBase):
    id: str = Field(default_factory=_new_id)
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price_retail: Optional[float] = None
    price_professional: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    variations: Optional[List[ProductVariation]] = None
    tags: Optional[List[str]] = None
    featured: Optional[bool] = None
    active: Optional[bool] = None


# ---------- Order ----------
OrderStatus = Literal["Pendiente", "Pagado", "Enviado", "Completado", "Cancelado"]
PaymentMethod = Literal["stripe", "paypal", "transfer"]
DeliveryMethod = Literal["shipping", "pickup"]


class Address(BaseModel):
    full_name: str
    phone: Optional[str] = None
    street: str
    city: str
    province: str
    postal_code: str
    country: str = "España"
    notes: Optional[str] = None


class OrderItem(BaseModel):
    product_id: str
    sku: str
    name: str
    variation_name: Optional[str] = None
    unit_price: float
    quantity: int
    image_url: str = ""

    @property
    def line_total(self) -> float:
        return round(self.unit_price * self.quantity, 2)


class OrderCreate(BaseModel):
    email: EmailStr
    items: List[OrderItem]
    shipping_address: Address
    billing_address: Optional[Address] = None
    customer_type: Literal["retail", "professional"] = "retail"
    payment_method: PaymentMethod = "stripe"
    delivery_method: DeliveryMethod = "shipping"
    notes: Optional[str] = None
    origin_url: Optional[str] = None


class Order(BaseModel):
    id: str = Field(default_factory=_new_id)
    order_number: str
    email: EmailStr
    user_id: Optional[str] = None
    customer_type: Literal["retail", "professional"] = "retail"
    items: List[OrderItem]
    shipping_address: Address
    billing_address: Optional[Address] = None
    subtotal: float
    shipping_cost: float
    total: float
    currency: str = "EUR"
    status: OrderStatus = "Pendiente"
    payment_method: PaymentMethod = "stripe"
    payment_status: str = "pending"
    payment_session_id: Optional[str] = None
    payment_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ---------- Payment Transaction ----------
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=_new_id)
    order_id: str
    session_id: Optional[str] = None
    provider: Literal["stripe", "paypal"]
    amount: float
    currency: str = "EUR"
    email: EmailStr
    metadata: dict = Field(default_factory=dict)
    payment_status: str = "initiated"
    status: str = "initiated"
    processed: bool = False
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)


# ---------- Price Log ----------
class PriceLogEntry(BaseModel):
    id: str = Field(default_factory=_new_id)
    sku: str
    old_retail: Optional[float] = None
    new_retail: Optional[float] = None
    old_professional: Optional[float] = None
    new_professional: Optional[float] = None
    source: str = "excel_import"
    created_at: str = Field(default_factory=_now_iso)


class ImportSummary(BaseModel):
    total_rows: int
    updated: int
    not_found: int
    errors: List[str]
    not_found_skus: List[str]


# ---------- Shipping ----------
class ShippingQuote(BaseModel):
    subtotal: float
    shipping_cost: float
    total: float
    free_shipping_threshold: float
    remaining_for_free_shipping: float
    free_shipping: bool


# ---------- Reviews ----------
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class Review(BaseModel):
    id: str = Field(default_factory=_new_id)
    product_id: str
    user_id: str
    user_name: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)
