@echo off
echo Pushing Vercel Image Fixes to GitHub...
git add .
git commit -m "fix: resolve broken CMS images and optimize load speeds for Vercel deployment"
git push origin HEAD
echo.
echo Done! Press any key to exit.
pause >nul
