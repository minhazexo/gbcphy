@echo off
REM Deployment Script for DOP Website (Windows)
REM Usage: deploy.bat [production|staging|preview|status|logs|setup|help]

echo ======================================
echo  🚀 DOP Website Deployment Script
echo ======================================

REM Check Node.js version
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if Netlify CLI is installed
where netlify >nul 2>&1
if errorlevel 1 (
    echo ⚠ Netlify CLI not found. Installing...
    npm install -g netlify-cli
)

if "%1"=="" goto help

if "%1"=="production" goto production
if "%1"=="staging" goto staging
if "%1"=="preview" goto preview
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="setup" goto setup
if "%1"=="help" goto help

echo ❌ Unknown command: %1
goto help

:production
echo.
echo 📦 Deploying to PRODUCTION...
echo Message: %2
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
netlify deploy --prod --dir=build --message="%2"
goto end

:staging
echo.
echo 🚧 Deploying to STAGING...
echo Message: %2
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
netlify deploy --dir=build --message="%2"
goto end

:preview
echo.
echo 👀 Deploying to PREVIEW...
echo Message: %2
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
netlify deploy --dir=build --alias=preview --message="%2"
goto end

:status
echo.
echo 📊 Checking deployment status...
netlify status
goto end

:logs
echo.
echo 📝 Showing deployment logs...
netlify logs
goto end

:setup
echo.
echo ⚙ Setting up deployment environment...
netlify login
netlify init
echo ✅ Setup completed!
goto end

:help
echo.
echo 📖 Usage:
echo   deploy.bat production [message]  - Deploy to production
echo   deploy.bat staging [message]     - Deploy to staging
echo   deploy.bat preview [message]     - Deploy to preview
echo   deploy.bat status                - Check deployment status
echo   deploy.bat logs                  - Show deployment logs
echo   deploy.bat setup                 - Setup deployment environment
echo   deploy.bat help                  - Show this help
echo.
echo 📖 Quick deploy with npm:
echo   npm run deploy                   - Deploy to production
echo   npm run deploy:staging           - Deploy to staging
echo   npm run deploy:preview           - Deploy to preview
echo.
echo 📖 Git workflow (recommended):
echo   git add .
echo   git commit -m "Your message"
echo   git push origin master
echo   REM Netlify will auto-deploy
goto end

:end
echo.
echo ✨ Deployment script completed!
pause