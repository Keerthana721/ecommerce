@echo off
echo ===================================================
echo Starting E-Commerce Vite + React Frontend UI...
echo ===================================================
cd e-commerce-ui
if not exist node_modules (
    echo node_modules not found. Installing dependencies...
    call npm install
)
echo.
echo Starting Vite Dev Server...
call npm run dev
pause
