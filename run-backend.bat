@echo off
echo ===================================================
echo Starting E-Commerce Backend Microservices...
echo ===================================================

echo 1. Launching Eureka Discovery Server (Port 8761)...
start "EUREKA-SERVER" cmd /k "cd EurekaServer && mvnw spring-boot:run"
echo Waiting 15 seconds for Eureka Server to initialize...
timeout /t 15 /nobreak > nul

echo 2. Launching Config Server (Port 8888)...
start "CONFIG-SERVER" cmd /k "cd ConfigServer && mvnw spring-boot:run"
echo Waiting 15 seconds for Config Server to fetch Git configurations...
timeout /t 15 /nobreak > nul

echo 3. Launching API Gateway (Port 8089)...
start "APIGATEWAY" cmd /k "cd APIGateway && mvnw spring-boot:run"
echo Waiting 10 seconds for API Gateway to boot...
timeout /t 10 /nobreak > nul

echo 4. Launching Core Microservices in parallel...
start "USER-SERVICE" cmd /k "cd UserService && mvnw spring-boot:run"
start "PRODUCT-SERVICE" cmd /k "cd ProductService && mvnw spring-boot:run"
start "INVENTORY-SERVICE" cmd /k "cd InventoryService && mvnw spring-boot:run"
start "PAYMENT-SERVICE" cmd /k "cd PaymentService && mvnw spring-boot:run"
start "ORDER-SERVICE" cmd /k "cd Orderservice && mvnw spring-boot:run"
start "NOTIFICATION-SERVICE" cmd /k "cd NotificationService && mvnw spring-boot:run"
start "SHIPPING-SERVICE" cmd /k "cd ShippingService8 && mvnw spring-boot:run"
start "INVOICE-SERVICE" cmd /k "cd InvoiceService && mvnw spring-boot:run"

echo.
echo All microservices are booting in separate console windows!
echo - Eureka Registry: http://localhost:8761
echo - Config Server Status: http://localhost:8888/product-service/default
echo - API Gateway Entrypoint: http://localhost:8089
echo.
pause
