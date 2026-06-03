"""
Ecoandes E-commerce API Tests
Tests for: Auth, Products, Orders, Admin, Payments
"""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@ecoandes.com"
ADMIN_PASSWORD = "Admin123!"

# Test user for registration tests
TEST_USER_EMAIL = f"test_{uuid.uuid4().hex[:8]}@ecoandes.com"
TEST_PRO_EMAIL = f"pro_{uuid.uuid4().hex[:8]}@ecoandes.com"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="module")
def admin_client(api_client, admin_token):
    """Session with admin auth header"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return session


# ==================== Health Check ====================
class TestHealth:
    """Health endpoint tests"""

    def test_health_endpoint(self, api_client):
        """GET /api/health returns ok status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "ts" in data
        print(f"✓ Health check passed: {data}")


# ==================== Auth Tests ====================
class TestAuth:
    """Authentication endpoint tests"""

    def test_register_retail_user(self, api_client):
        """POST /api/auth/register - retail user"""
        payload = {
            "email": TEST_USER_EMAIL,
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "Retail",
            "role": "retail",
        }
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Register failed: {response.text}"
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL.lower()
        assert data["role"] == "retail"
        assert "id" in data
        print(f"✓ Retail user registered: {data['email']}")

    def test_register_professional_user(self, api_client):
        """POST /api/auth/register - professional user with company"""
        payload = {
            "email": TEST_PRO_EMAIL,
            "password": "ProPass123!",
            "first_name": "Test",
            "last_name": "Professional",
            "role": "professional",
            "company": "Test Company SL",
            "tax_id": "B12345678",
        }
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Register failed: {response.text}"
        data = response.json()
        assert data["email"] == TEST_PRO_EMAIL.lower()
        assert data["role"] == "professional"
        assert data["company"] == "Test Company SL"
        print(f"✓ Professional user registered: {data['email']}")

    def test_register_duplicate_email(self, api_client):
        """POST /api/auth/register - duplicate email returns 400"""
        payload = {
            "email": ADMIN_EMAIL,
            "password": "TestPass123!",
            "first_name": "Duplicate",
            "last_name": "User",
            "role": "retail",
        }
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 400
        print("✓ Duplicate email rejected correctly")

    def test_login_success(self, api_client):
        """POST /api/auth/login - valid credentials"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL.lower()
        assert data["user"]["role"] == "admin"
        print(f"✓ Login successful for: {data['user']['email']}")

    def test_login_invalid_credentials(self, api_client):
        """POST /api/auth/login - invalid credentials returns 401"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpass"},
        )
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")

    def test_me_authenticated(self, admin_client):
        """GET /api/auth/me - returns authenticated user"""
        response = admin_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL.lower()
        assert data["role"] == "admin"
        print(f"✓ /me returned user: {data['email']}")

    def test_me_unauthenticated(self, api_client):
        """GET /api/auth/me - without token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /me without auth rejected correctly")


# ==================== Products Tests ====================
class TestProducts:
    """Product endpoint tests"""

    def test_list_products(self, api_client):
        """GET /api/products - public list"""
        response = api_client.get(f"{BASE_URL}/api/products", params={"limit": 10})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected seeded products"
        # Verify product structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "sku" in product
        assert "display_price" in product
        print(f"✓ Listed {len(data)} products")

    def test_list_categories(self, api_client):
        """GET /api/products/categories"""
        response = api_client.get(f"{BASE_URL}/api/products/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected categories from seeded products"
        print(f"✓ Found {len(data)} categories: {data[:5]}...")

    def test_get_product_by_slug(self, api_client):
        """GET /api/products/slug/{slug} - harina-de-avena-integral-bio"""
        response = api_client.get(f"{BASE_URL}/api/products/slug/harina-de-avena-integral-bio")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "display_price" in data
        assert data["slug"] == "harina-de-avena-integral-bio"
        print(f"✓ Found product by slug: {data['name']}")

    def test_get_product_not_found(self, api_client):
        """GET /api/products/slug/{slug} - non-existent returns 404"""
        response = api_client.get(f"{BASE_URL}/api/products/slug/non-existent-product-xyz")
        assert response.status_code == 404
        print("✓ Non-existent product returns 404")

    def test_dual_pricing_guest(self, api_client):
        """Guest user sees retail price as display_price"""
        response = api_client.get(f"{BASE_URL}/api/products/slug/harina-de-avena-integral-bio")
        assert response.status_code == 200
        data = response.json()
        # For guest, display_price should equal price_retail
        assert data["display_price"] == data["price_retail"]
        print(f"✓ Guest sees retail price: {data['display_price']}")

    def test_dual_pricing_admin(self, admin_client):
        """Admin user sees professional price as display_price"""
        response = admin_client.get(f"{BASE_URL}/api/products/slug/harina-de-avena-integral-bio")
        assert response.status_code == 200
        data = response.json()
        # For admin/professional, display_price should equal price_professional
        assert data["display_price"] == data["price_professional"]
        print(f"✓ Admin sees professional price: {data['display_price']}")

    def test_search_products(self, api_client):
        """GET /api/products with search filter"""
        response = api_client.get(f"{BASE_URL}/api/products", params={"search": "harina", "limit": 50})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find products with "harina" in name
        if len(data) > 0:
            print(f"✓ Search 'harina' found {len(data)} products")
        else:
            print("✓ Search returned empty (may be expected)")

    def test_featured_products(self, api_client):
        """GET /api/products with featured filter"""
        response = api_client.get(f"{BASE_URL}/api/products", params={"featured": True, "limit": 10})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned should be featured
        for p in data:
            assert p.get("featured") == True
        print(f"✓ Found {len(data)} featured products")


# ==================== Orders Tests ====================
class TestOrders:
    """Order endpoint tests"""

    @pytest.fixture(scope="class")
    def sample_product(self, api_client):
        """Get a sample product for order tests"""
        response = api_client.get(f"{BASE_URL}/api/products", params={"limit": 1})
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        return products[0]

    def test_shipping_quote_retail_under_threshold(self, api_client):
        """POST /api/orders/shipping-quote - subtotal 25€ retail -> 6.5€ shipping"""
        response = api_client.post(
            f"{BASE_URL}/api/orders/shipping-quote",
            json={"subtotal": 25, "customer_type": "retail"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["subtotal"] == 25
        assert data["shipping_cost"] == 6.5
        assert data["total"] == 31.5
        assert data["free_shipping"] == False
        assert data["free_shipping_threshold"] == 60
        print(f"✓ Shipping quote: {data['subtotal']}€ + {data['shipping_cost']}€ = {data['total']}€")

    def test_shipping_quote_free_shipping(self, api_client):
        """POST /api/orders/shipping-quote - subtotal 70€ -> free shipping"""
        response = api_client.post(
            f"{BASE_URL}/api/orders/shipping-quote",
            json={"subtotal": 70, "customer_type": "retail"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["subtotal"] == 70
        assert data["shipping_cost"] == 0.0
        assert data["total"] == 70
        assert data["free_shipping"] == True
        print(f"✓ Free shipping for {data['subtotal']}€ order")

    def test_shipping_quote_professional(self, api_client):
        """POST /api/orders/shipping-quote - professional rate 4.5€"""
        response = api_client.post(
            f"{BASE_URL}/api/orders/shipping-quote",
            json={"subtotal": 25, "customer_type": "professional"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["shipping_cost"] == 4.5
        print(f"✓ Professional shipping: {data['shipping_cost']}€")

    def test_create_guest_order(self, api_client, sample_product):
        """POST /api/orders - guest order creation"""
        payload = {
            "email": "guest@test.com",
            "items": [
                {
                    "product_id": sample_product["id"],
                    "sku": sample_product["sku"],
                    "name": sample_product["name"],
                    "variation_name": None,
                    "unit_price": sample_product["display_price"],
                    "quantity": 2,
                    "image_url": sample_product.get("image_url", ""),
                }
            ],
            "shipping_address": {
                "full_name": "Test Guest",
                "phone": "600123456",
                "street": "Calle Test 123",
                "city": "Madrid",
                "province": "Madrid",
                "postal_code": "28001",
                "country": "España",
            },
            "customer_type": "retail",
            "payment_method": "stripe",
        }
        response = api_client.post(f"{BASE_URL}/api/orders", json=payload)
        assert response.status_code == 200, f"Order creation failed: {response.text}"
        data = response.json()
        assert "order_number" in data
        assert data["order_number"].startswith("ECO-")
        assert data["status"] == "Pendiente"
        assert data["email"] == "guest@test.com"
        print(f"✓ Guest order created: {data['order_number']}")
        return data

    def test_create_order_empty_cart(self, api_client):
        """POST /api/orders - empty cart returns 400"""
        payload = {
            "email": "test@test.com",
            "items": [],
            "shipping_address": {
                "full_name": "Test",
                "street": "Test",
                "city": "Test",
                "province": "Test",
                "postal_code": "12345",
                "country": "España",
            },
            "customer_type": "retail",
            "payment_method": "stripe",
        }
        response = api_client.post(f"{BASE_URL}/api/orders", json=payload)
        assert response.status_code == 400
        print("✓ Empty cart order rejected")


# ==================== Admin Orders Tests ====================
class TestAdminOrders:
    """Admin order management tests"""

    def test_admin_list_orders(self, admin_client):
        """GET /api/orders/admin/list - admin only"""
        response = admin_client.get(f"{BASE_URL}/api/orders/admin/list")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin listed {len(data)} orders")

    def test_admin_list_orders_unauthorized(self, api_client):
        """GET /api/orders/admin/list - without auth returns 401"""
        response = api_client.get(f"{BASE_URL}/api/orders/admin/list")
        assert response.status_code == 401
        print("✓ Admin orders list requires auth")

    def test_admin_stats(self, admin_client):
        """GET /api/orders/admin/stats - returns order statistics"""
        response = admin_client.get(f"{BASE_URL}/api/orders/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "orders_total" in data
        assert "orders_pending" in data
        assert "orders_paid" in data
        assert "revenue" in data
        assert "customers" in data
        assert "products" in data
        print(f"✓ Admin stats: {data['orders_total']} orders, {data['customers']} customers")

    def test_admin_update_order_status(self, admin_client):
        """PATCH /api/orders/admin/{order_id}/status - update order status"""
        # First create an order
        products_resp = admin_client.get(f"{BASE_URL}/api/products", params={"limit": 1})
        product = products_resp.json()[0]
        
        order_payload = {
            "email": "status_test@test.com",
            "items": [
                {
                    "product_id": product["id"],
                    "sku": product["sku"],
                    "name": product["name"],
                    "variation_name": None,
                    "unit_price": product["display_price"],
                    "quantity": 1,
                    "image_url": "",
                }
            ],
            "shipping_address": {
                "full_name": "Status Test",
                "street": "Test St",
                "city": "Test City",
                "province": "Test",
                "postal_code": "12345",
                "country": "España",
            },
            "customer_type": "retail",
            "payment_method": "transfer",
        }
        order_resp = admin_client.post(f"{BASE_URL}/api/orders", json=order_payload)
        assert order_resp.status_code == 200
        order = order_resp.json()
        
        # Update status
        response = admin_client.patch(
            f"{BASE_URL}/api/orders/admin/{order['id']}/status",
            json={"status": "Pagado"},
        )
        assert response.status_code == 200
        updated = response.json()
        assert updated["status"] == "Pagado"
        print(f"✓ Order {order['order_number']} status updated to Pagado")


# ==================== Admin Users Tests ====================
class TestAdminUsers:
    """Admin user management tests"""

    def test_admin_list_users(self, admin_client):
        """GET /api/admin/users - admin only"""
        response = admin_client.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0  # At least admin user
        # Verify no password_hash exposed
        for user in data:
            assert "password_hash" not in user
        print(f"✓ Admin listed {len(data)} users")

    def test_admin_list_users_unauthorized(self, api_client):
        """GET /api/admin/users - without auth returns 401"""
        response = api_client.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 401
        print("✓ Admin users list requires auth")

    def test_admin_list_users_by_role(self, admin_client):
        """GET /api/admin/users - filter by role"""
        response = admin_client.get(f"{BASE_URL}/api/admin/users", params={"role": "admin"})
        assert response.status_code == 200
        data = response.json()
        for user in data:
            assert user["role"] == "admin"
        print(f"✓ Filtered {len(data)} admin users")


# ==================== Admin Price Import Tests ====================
class TestAdminPriceImport:
    """Admin price import tests"""

    def test_price_logs_empty_or_list(self, admin_client):
        """GET /api/admin/prices/logs - returns list"""
        response = admin_client.get(f"{BASE_URL}/api/admin/prices/logs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Price logs: {len(data)} entries")

    def test_price_import_unauthorized(self, api_client):
        """POST /api/admin/prices/import - without auth returns 401"""
        response = api_client.post(f"{BASE_URL}/api/admin/prices/import")
        assert response.status_code in [401, 422]  # 422 if missing file
        print("✓ Price import requires auth")


# ==================== Admin Cloudinary Tests ====================
class TestAdminCloudinary:
    """Admin Cloudinary signature tests"""

    def test_cloudinary_signature_not_configured(self, admin_client):
        """GET /api/admin/cloudinary/signature - returns 400 when not configured"""
        response = admin_client.get(f"{BASE_URL}/api/admin/cloudinary/signature")
        # Should return 400 since Cloudinary is not configured
        assert response.status_code == 400
        data = response.json()
        assert "Cloudinary no está configurado" in data.get("detail", "")
        print("✓ Cloudinary signature returns 400 when not configured")


# ==================== Payments Tests ====================
class TestPayments:
    """Payment endpoint tests"""

    def test_stripe_checkout_creates_session(self, admin_client):
        """POST /api/payments/stripe/checkout - creates Stripe session"""
        # First create an order
        products_resp = admin_client.get(f"{BASE_URL}/api/products", params={"limit": 1})
        product = products_resp.json()[0]
        
        order_payload = {
            "email": "stripe_test@test.com",
            "items": [
                {
                    "product_id": product["id"],
                    "sku": product["sku"],
                    "name": product["name"],
                    "variation_name": None,
                    "unit_price": product["display_price"],
                    "quantity": 1,
                    "image_url": "",
                }
            ],
            "shipping_address": {
                "full_name": "Stripe Test",
                "street": "Test St",
                "city": "Test City",
                "province": "Test",
                "postal_code": "12345",
                "country": "España",
            },
            "customer_type": "retail",
            "payment_method": "stripe",
        }
        order_resp = admin_client.post(f"{BASE_URL}/api/orders", json=order_payload)
        assert order_resp.status_code == 200
        order = order_resp.json()
        
        # Create Stripe checkout session
        response = admin_client.post(
            f"{BASE_URL}/api/payments/stripe/checkout",
            json={
                "order_id": order["id"],
                "origin_url": "https://example.com",
            },
        )
        assert response.status_code == 200, f"Stripe checkout failed: {response.text}"
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        print(f"✓ Stripe session created: {data['session_id'][:20]}...")

    def test_paypal_not_configured(self, admin_client):
        """POST /api/payments/paypal/create - returns 400 when not configured"""
        # First create an order
        products_resp = admin_client.get(f"{BASE_URL}/api/products", params={"limit": 1})
        product = products_resp.json()[0]
        
        order_payload = {
            "email": "paypal_test@test.com",
            "items": [
                {
                    "product_id": product["id"],
                    "sku": product["sku"],
                    "name": product["name"],
                    "variation_name": None,
                    "unit_price": product["display_price"],
                    "quantity": 1,
                    "image_url": "",
                }
            ],
            "shipping_address": {
                "full_name": "PayPal Test",
                "street": "Test St",
                "city": "Test City",
                "province": "Test",
                "postal_code": "12345",
                "country": "España",
            },
            "customer_type": "retail",
            "payment_method": "paypal",
        }
        order_resp = admin_client.post(f"{BASE_URL}/api/orders", json=order_payload)
        assert order_resp.status_code == 200
        order = order_resp.json()
        
        # Try PayPal - should fail since not configured
        response = admin_client.post(
            f"{BASE_URL}/api/payments/paypal/create",
            json={
                "order_id": order["id"],
                "origin_url": "https://example.com",
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert "PayPal no está configurado" in data.get("detail", "")
        print("✓ PayPal returns 400 when not configured")


# ==================== Admin-only Route Protection Tests ====================
class TestAdminProtection:
    """Test that admin routes are properly protected"""

    def test_admin_routes_require_auth(self, api_client):
        """Admin routes return 401 without token"""
        admin_routes = [
            ("GET", "/api/orders/admin/list"),
            ("GET", "/api/orders/admin/stats"),
            ("GET", "/api/admin/users"),
            ("GET", "/api/admin/prices/logs"),
        ]
        for method, route in admin_routes:
            if method == "GET":
                response = api_client.get(f"{BASE_URL}{route}")
            assert response.status_code == 401, f"{route} should require auth"
        print("✓ All admin routes require authentication")

    def test_admin_routes_require_admin_role(self, api_client):
        """Admin routes return 403 for non-admin users"""
        # Login as retail user
        retail_email = f"retail_test_{uuid.uuid4().hex[:6]}@test.com"
        api_client.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": retail_email,
                "password": "Test123!",
                "first_name": "Retail",
                "last_name": "Test",
                "role": "retail",
            },
        )
        login_resp = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": retail_email, "password": "Test123!"},
        )
        token = login_resp.json()["access_token"]
        
        # Try admin routes with retail token
        headers = {"Authorization": f"Bearer {token}"}
        response = api_client.get(f"{BASE_URL}/api/orders/admin/list", headers=headers)
        assert response.status_code == 403
        print("✓ Admin routes return 403 for non-admin users")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
