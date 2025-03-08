@echo off
echo ===============================
echo Deploying to Cloudflare Workers
echo ===============================
echo.
echo Building project...
call npm run build
echo.
echo Deploying to Cloudflare...
call npx wrangler deploy
echo.
echo Deployment complete!
echo.
pause 