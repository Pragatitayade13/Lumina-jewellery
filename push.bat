@echo off
echo Pushing code to GitHub...
git remote set-url origin https://github.com/Pragatitayade13/Lumina-jewellery.git
git add .
git commit -m "feat: complete coupon management system, offers page, and cart updates"
git push origin HEAD
echo.
echo Done! Press any key to exit.
pause >nul
