# 🔄 E-Commerce System: End-to-End Business Flow & Saga Orchestration Reference

This reference details the precise data payloads, database SQL statements, and Kafka messaging models exchanged during a complete checkout transaction.

---

## 🗺️ Step-by-Step Purchase Flow Execution

### Step 1: User Registration
* **Endpoint**: `POST http://localhost:8089/users`
* **JSON Request Payload**:
```json
{
  "username": "keerthana123",
  "email": "keerthika1124@gmail.com",
  "password": "password123",
  "role": "ADMIN",
  "firstName": "Keerthana",
  "lastName": "Selvaraj"
}
```
* **PostgreSQL Database Operation**:
```sql
INSERT INTO users (username, email, password, role, first_name, last_name, is_active, is_email_verified, created_at, updated_at)
VALUES ('keerthana123', 'keerthika1124@gmail.com', '$2a$10$XD0cVJi2eXe4...', 'ADMIN', 'Keerthana', 'Selvaraj', true, false, NOW(), NOW());
```

---

### Step 2: Request & Verify Email OTP
1. **Send OTP Code**: `POST http://localhost:8089/users/send-verification-code?email=keerthika1124@gmail.com`
   * **PostgreSQL Database Operation**:
     ```sql
     UPDATE users 
     SET verification_code = '382901', 
         verification_code_expiry = NOW() + INTERVAL '15 minutes' 
     WHERE email = 'keerthika1124@gmail.com';
     ```
2. **Verify OTP**: `POST http://localhost:8089/users/verify-code`
   * **JSON Request Payload**:
     ```json
     {
       "email": "keerthika1124@gmail.com",
       "code": "382901"
     }
     ```
   * **PostgreSQL Database Operation**:
     ```sql
     UPDATE users 
     SET is_email_verified = true, 
         verification_code = NULL, 
         verification_code_expiry = NULL 
     WHERE email = 'keerthika1124@gmail.com';
     ```

---

### Step 3: Browse Catalog & Add Product
* **Endpoint**: `POST http://localhost:8089/products`
* **JSON Request Payload**:
```json
{
  "name": "Logitech MX Master 3S",
  "description": "Ergonomic wireless mouse",
  "price": 99.99,
  "discountPrice": 89.99,
  "sku": "LOGI-MX3S",
  "category": "Electronics",
  "quantity": 100
}
```
* **PostgreSQL Database Operation**:
```sql
INSERT INTO products (name, description, price, discount_price, sku, category, quantity, is_active, created_at, updated_at)
VALUES ('Logitech MX Master 3S', 'Ergonomic wireless mouse', 99.99, 89.99, 'LOGI-MX3S', 'Electronics', 100, true, NOW(), NOW());
```

---

### Step 4: Place Order (Starts Saga Orchestration)
* **Endpoint**: `POST http://localhost:8089/orders/place`
* **JSON Request Payload**:
```json
{
  "userId": 4,
  "totalAmount": 179.98,
  "shippingAddress": "No 42, Mount Road, Chennai, TN, 600032, India",
  "items": [
    {
      "productId": 5,
      "productName": "Logitech MX Master 3S",
      "quantity": 2,
      "price": 89.99
    }
  ]
}
```
* **PostgreSQL Database Operation**:
```sql
INSERT INTO orders (user_id, total_amount, shipping_address, status, payment_status, created_at, updated_at)
VALUES (4, 179.98, 'No 42, Mount Road, Chennai, TN, 600032, India', 'PENDING', 'UNPAID', NOW(), NOW());

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES (15, 5, 'Logitech MX Master 3S', 2, 89.99, 179.98);
```
* **Kafka Event Dispatched (`order-created-topic`)**:
```json
{
  "orderId": 15,
  "userId": 4,
  "totalAmount": 179.98,
  "items": [
    {
      "productId": 5,
      "quantity": 2,
      "price": 89.99
    }
  ]
}
```

---

### Step 5: Lock Stock (`INVENTORY-SERVICE`)
* **Kafka Event Consumed**: `order-created-topic`
* **PostgreSQL Database Operation**:
```sql
UPDATE inventory
SET reserved_quantity = reserved_quantity + 2
WHERE product_id = 5;
```
* **Kafka Event Dispatched (`inventory-reserved-topic`)**:
```json
{
  "orderId": 15,
  "status": "RESERVED"
}
```

---

### Step 6: Charge Payment (`PAYMENT-SERVICE`)
* **Kafka Event Consumed**: `inventory-reserved-topic`
* **PostgreSQL Database Operation**:
```sql
INSERT INTO payments (order_id, amount, payment_method, status, transaction_id, created_at, updated_at)
VALUES (15, 179.98, 'RAZORPAY', 'COMPLETED', 'pay_Hjdf92h4ksda', NOW(), NOW());
```
* **Kafka Event Dispatched (`payment-processed-topic`)**:
```json
{
  "orderId": 15,
  "paymentId": 8,
  "amount": 179.98,
  "status": "SUCCESS"
}
```

---

### Step 7: Order Confirmation (`ORDER-SERVICE`)
* **Kafka Event Consumed**: `payment-processed-topic`
* **PostgreSQL Database Operation**:
```sql
UPDATE orders 
SET status = 'CONFIRMED', 
    payment_status = 'PAID', 
    updated_at = NOW() 
WHERE id = 15;
```
* **Kafka Event Dispatched (`order-confirmed-topic`)**:
```json
{
  "orderId": 15,
  "userId": 4,
  "totalAmount": 179.98,
  "shippingAddress": "No 42, Mount Road, Chennai, TN, 600032, India"
}
```

---

### Step 8: Invoice Generation & Shipping Booking
* **Invoice Service**:
  * **Kafka Event Consumed**: `order-confirmed-topic`
  * **PostgreSQL Database Operation**:
    ```sql
    INSERT INTO invoices (order_id, invoice_number, total_amount, status, issued_date)
    VALUES (15, 'INV-2026-973A', 179.98, 'PAID', NOW());
    ```
* **Shipping Service**:
  * **Kafka Event Consumed**: `order-confirmed-topic`
  * **PostgreSQL Database Operation**:
    ```sql
    INSERT INTO shipping (order_id, tracking_number, carrier, status, estimated_delivery)
    VALUES (15, 'TRK-FEDEX83C90', 'FEDEX', 'SHIPPED', NOW() + INTERVAL '3 days');
    ```

---

### Step 9: Deliver Notifications (`NOTIFICATION-SERVICE`)
* **Kafka Events Consumed**: `invoice-generated-topic` & `shipping-created-topic`
* **Internal Feign Lookup**: Calls `GET http://USER-SERVICE/users/internal/email?userId=4` to resolve customer email `keerthika1124@gmail.com`.
* **Action**: Dispatches email containing PDF invoice link and tracking codes.
