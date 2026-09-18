# 🛠️ E-Commerce Microservices: Development & Reference Documentation

This document serves as the primary technical reference guide for local development, system setup, and debugging of the e-commerce microservices cluster.

---

## 🗺️ Architectural Port Map & Entrypoints

All frontend and external client requests route through the **API Gateway** on port `8089`. The gateway handles JWT token extraction, open endpoint whitelisting, and routing dynamically using Eureka service discovery.

| Microservice | Gateway Prefix | Target Port | Database Schema | Primary Role |
|---|---|---|---|---|
| **APIGATEWAY** | *None* | `8089` | *None* | Gateway routing, JWT check |
| **USER-SERVICE** | `/users/**` | `8082` | `users` | Security, profiles, registration |
| **PRODUCT-SERVICE**| `/products/**` | `8081` | `products` | Product master, catalogs |
| **CART-SERVICE** | `/cart/**` | `8088` | `cart_db` | User shopping carts |
| **ORDER-SERVICE** | `/orders/**` | `8087` | `orders` | Transaction saga orchestration |
| **INVENTORY-SERVICE**| `/inventory/**` | `8085` | `inventory` | Stock allocation & locks |
| **PAYMENT-SERVICE** | `/payments/**` | `8084` | `payments` | Credit cards / Razorpay gateway |
| **INVOICE-SERVICE** | `/invoices/**` | `8086` | `invoices` | Billing & invoices calculation |
| **SHIPPING-SERVICE**| `/shipping/**` | `8083` | `shipping` | Order logistics & courier tracking |
| **NOTIFICATION-SERV**| `/notifications/**` | `8008` | `notifications` | Mail/SMS dispatch simulations |

---

## 🚀 Step-by-Step Local Startup Sequence

To ensure discovery registration and configuration files bind correctly, launch the microservices in the following sequence:

### Step 1: Start Docker Infrastructure
Launch PostgreSQL, Apache Kafka, Zookeeper, and Zipkin container instances:
```bash
# Run inside the workspace containing docker-compose.yml
docker-compose down
docker-compose up -d
```
*Verify PostgreSQL is running on port `5432` and Kafka is accessible on `9092`.*

### Step 2: Start Service Registry & Config Server
1. Launch **EUREKA-SERVER** (Port `8761`). Wait until the dashboard is fully accessible at `http://localhost:8761`.
2. Launch **CONFIG-SERVER** (Port `8888`).

### Step 3: Launch Core Backend Microservices
Launch the remaining services in any order:
* `PRODUCT-SERVICE` (Port `8081`)
* `USER-SERVICE` (Port `8082`)
* `SHIPPING-SERVICE` (Port `8083`)
* `PAYMENT-SERVICE` (Port `8084`)
* `INVENTORY-SERVICE` (Port `8085`)
* `INVOICE-SERVICE` (Port `8086`)
* `ORDER-SERVICE` (Port `8087`)
* `NOTIFICATION-SERVICE` (Port `8008`)
* `APIGATEWAY` (Port `8089`)

---

## ⚙️ Core Developer Configurations

### 1. Database Connection Footprint limits (HikariCP)
To prevent connection exhaustion (`FATAL: sorry, too many clients already`) on local PostgreSQL databases when running all 8 microservices simultaneously, ensure every database-backed service has its Hikari pool size restricted inside its `application.properties`:
```properties
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.connection-timeout=5000
```
This caps the combined database connection footprint of the entire cluster to **24 connections**, well below PostgreSQL default caps.

### 2. Spring Security Whitelists
If adding text-based endpoints (like `/users/verify-code` or `/users/send-verification-code`), ensure they are whitelisted in `SecurityConfig.java` alongside `/error` endpoints to avoid masking runtime errors under `403 Forbidden` statuses:
```java
.requestMatchers(
        "/users/login", "/users/login/**",
        "/users/send-verification-code", "/users/send-verification-code/**",
        "/users/verify-code", "/users/verify-code/**",
        "/error", "/error/**"
).permitAll()
```

### 3. Controller Path Routing Rules
To prevent path collisions between dynamic parameters (`GET /users/{id}`) and text subpaths (like `GET /users/send-verification-code`), always apply numeric regex boundaries to `Long id` paths:
```java
@GetMapping("/{id:[0-9]+}")
public ResponseEntity<?> getUserById(@PathVariable Long id) { ... }
```

---

## 📬 Postman Test Commands & Payload Formats

### 1. User Registration (`POST http://localhost:8089/users`)
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

### 2. Request OTP Code (`POST http://localhost:8089/users/send-verification-code?email=keerthika1124@gmail.com`)
*Simulates sending a 6-digit OTP and prints the code directly in the console log of `USER-SERVICE`.*

### 3. Verify OTP (`POST http://localhost:8089/users/verify-code`)
```json
{
  "email": "keerthika1124@gmail.com",
  "code": "123456"
}
```
*(Replaces `123456` with the code printed in the logs).*
