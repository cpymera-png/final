#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Continuar desarrollo de EcoAndes (e-commerce BIO). Lote de mejoras: Click & Collect (recoger en tienda con pago por adelantado + notificación a la tienda) y reseñas con estrellas para clientes registrados, entre otras."

backend:
  - task: "Click & Collect (delivery_method=pickup) en creación de pedidos"
    implemented: true
    working: true
    file: "backend/routes/orders.py, backend/core/models.py, backend/routes/payments.py, backend/core/mailer.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Añadido campo delivery_method ('shipping'|'pickup') a OrderCreate y Order. En create_order, si delivery_method=='pickup' el shipping_cost se fuerza a 0 y total=subtotal. En _mark_paid_if_needed (payments) se dispara send_pickup_notification al email de la tienda (STORE_NOTIFICATION_EMAIL=ecoandesaraceli@gmail.com) cuando un pedido pickup queda pagado. NOTA: el envío real del email requiere RESEND_API_KEY (no configurada aún) — la función registra warning y hace skip sin romper el flujo."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL TESTS PASSED. Tested via backend_test.py: (1) POST /api/orders with delivery_method='pickup' correctly sets shipping_cost=0, total=subtotal, and delivery_method='pickup'. (2) POST /api/orders with delivery_method='shipping' and subtotal<50€ correctly charges shipping_cost=6.5€. (3) POST /api/orders/shipping-quote with subtotal=30 returns free_shipping=false, remaining=20.0. (4) POST /api/orders/shipping-quote with subtotal=55 returns free_shipping=true. All order creation flows working correctly."

  - task: "Reseñas y valoraciones de producto (solo clientes registrados)"
    implemented: true
    working: true
    file: "backend/routes/reviews.py, backend/core/models.py, backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Nuevo router /api/products/{product_id}/reviews. GET devuelve {summary:{average,count,distribution}, items, my_review}. POST requiere usuario autenticado (get_current_user) y rating 1-5; upsert (una reseña por usuario/producto, si existe la actualiza). Índice único (product_id,user_id). Registrado en server.py."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL TESTS PASSED. Tested via backend_test.py: (1) POST without auth correctly rejected with 401. (2) Admin login successful, token obtained. (3) POST with auth creates review with correct structure (user_name='Admin E.', rating=5, comment='Excelente producto'). (4) GET /api/products/{id}/reviews returns correct summary (count=1, average=5.0, distribution), items array, and my_review populated. (5) POST again with same user (rating=3, comment='Actualizado') correctly UPDATES existing review (upsert working, no duplicate created, count still 1, average now 3.0). (6) POST with invalid ratings (0 and 6) correctly rejected with 422 validation errors. All review endpoints working perfectly."

  - task: "Umbral de envío gratis actualizado a 50€"
    implemented: true
    working: true
    file: "backend/.env, backend/core/utils.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "FREE_SHIPPING_THRESHOLD cambiado de 60 a 50. Verificado por curl: shipping-quote con subtotal 30 => no free (remaining 20), 55 => free."

frontend:
  - task: "Checkout: selector de método de entrega (Envío vs Recoger en tienda)"
    implemented: true
    working: true
    file: "frontend/src/pages/Checkout.jsx, frontend/src/data/storeInfo.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Selector pickup/shipping. En pickup oculta dirección de envío, muestra tarjeta de la tienda, fuerza envío gratis y oculta transferencia. Pendiente de test de frontend (esperar permiso del usuario)."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL TESTS PASSED. Comprehensive Playwright testing completed: (1) Cart drawer shows free shipping progress notice correctly (subtotal 44,40€ < 50€ threshold, showing 'Te faltan 5,60€ para conseguir el envío gratis' with progress bar). (2) Checkout page loads with delivery methods section visible. (3) Default selection is 'Envío a domicilio' with shipping address fields visible. (4) When 'Recoger en tienda' selected: shipping address fields are HIDDEN (removed from DOM), store card appears with correct info (Tienda EcoAndes · Mercado Barceló, C. de Barceló 6, etc.), summary shows 'Recogida en tienda: Gratis', and total equals subtotal (44,40€ = 44,40€, no shipping added). (5) When switched back to 'Envío a domicilio': address fields reappear and shipping cost is charged (6,50€). All UI elements have correct data-testid attributes and functionality works perfectly."

  - task: "Ficha de producto: sección de reseñas con estrellas"
    implemented: true
    working: true
    file: "frontend/src/components/ProductReviews.jsx, frontend/src/components/StarRating.jsx, frontend/src/pages/ProductDetail.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Componente de reseñas con media, distribución, lista y formulario (solo logueados). Pendiente de test de frontend (esperar permiso del usuario)."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL TESTS PASSED. Comprehensive Playwright testing completed: (1) When logged OUT: login prompt visible (data-testid='review-login-prompt') with links to 'Inicia sesión' and 'Regístrate', review form NOT visible (correct behavior). (2) Login as admin@ecoandes.com successful. (3) When logged IN: review form visible (data-testid='review-form') with all 5 star buttons (data-testid='star-1' through 'star-5') and comment textarea (data-testid='review-comment'). (4) First review submission with 5 stars and comment 'Producto excelente, muy recomendable': success toast appeared ('Reseña actualizada'), review appears in list (data-testid='reviews-list') with user name 'Admin E.', average shows 5.0 (data-testid='reviews-average'), count shows '1 opinión' (data-testid='reviews-count'). (5) Second submission with 3 stars and updated comment 'Actualizado: producto bueno pero mejorable': review was UPDATED (upsert working correctly), count stayed at '1 opinión' (no duplicate created), average updated to 3.0, updated content appears in list. All functionality working perfectly including star rating interaction, form submission, toast notifications, and upsert logic."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: true

test_plan:
  current_focus:
    - "Checkout: selector de método de entrega (Envío vs Recoger en tienda)"
    - "Ficha de producto: sección de reseñas con estrellas"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Probar SOLO backend por ahora. 1) Reseñas: registrar/login un usuario retail (puedes usar admin@ecoandes.com / Admin123! o crear uno nuevo), obtener un product_id real vía GET /api/products?limit=1, hacer POST a /api/products/{id}/reviews con rating 1-5 (verificar que sin token da 401/403), GET para ver summary y my_review, y POST de nuevo para verificar el upsert (actualiza, no duplica). 2) Click & Collect: crear un pedido vía POST /api/orders con delivery_method='pickup' y comprobar que shipping_cost=0 y total=subtotal; y otro con delivery_method='shipping' (subtotal<50) para confirmar que sí cobra envío. Credenciales admin en /app/memory/test_credentials.md. No probar Stripe/PayPal real."
    -agent: "testing"
    -message: "✅ BACKEND TESTING COMPLETE - ALL TESTS PASSED. Both features (Product Reviews and Click & Collect) are working perfectly. Created comprehensive backend_test.py with 15+ test cases covering all requirements: authentication, review CRUD with upsert logic, validation (rating 1-5), pickup orders (shipping_cost=0), shipping orders (correct charges), and shipping-quote endpoint. All API endpoints responding correctly with proper status codes and data structures. No critical or major issues found. Ready for main agent to summarize and finish."
    -agent: "testing"
    -message: "✅ FRONTEND TESTING COMPLETE - ALL TESTS PASSED. Both frontend features tested comprehensively via Playwright: (1) Click & Collect checkout flow: cart drawer shows free shipping progress correctly, delivery method selector works perfectly, pickup option hides address fields and shows store card with 'Gratis' shipping, switching back to home delivery shows address fields and charges 6,50€ shipping. (2) Product reviews: login prompt shown when logged out, review form visible when logged in with all 5 star buttons, first review submission (5 stars) creates review with correct average/count, second submission (3 stars) UPDATES existing review (upsert working, no duplicate), average updates to 3.0. All data-testid attributes present and functional. No console errors. Minor network request aborts (navigation-related, not critical). Both features ready for production."
