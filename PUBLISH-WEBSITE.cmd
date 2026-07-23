@echo off
cd /d "%~dp0"
echo ============================================
echo   Publishing your website...
echo ============================================
echo.
call npm run publish
echo.
echo ============================================
echo   Finished. Press any key to close.
echo ============================================
pause >nul
