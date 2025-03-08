@echo off
echo Starting Weather Website in development mode...
echo.
echo Building project...
call npm run build
echo.
echo Starting local development server...
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev:worker 