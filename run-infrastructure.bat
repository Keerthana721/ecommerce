@echo off
echo ===================================================
echo Starting E-Commerce Infrastructure via Docker...
echo ===================================================
docker-compose up -d
if %errorlevel% neq 0 (
    echo Error: Failed to start docker-compose infrastructure. Make sure Docker is running.
    pause
    exit /b %errorlevel%
)
echo.
echo Infrastructure started successfully!
echo - Postgres: localhost:5432
echo - Zookeeper: localhost:2181
echo - Kafka: localhost:9092
echo - Zipkin: localhost:9411
echo.
pause
