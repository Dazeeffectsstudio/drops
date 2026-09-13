@echo off
cd /d "%~dp0"
echo DROPS demarre sur http://localhost:3000
echo Gardez cette fenetre ouverte pendant l'utilisation.
node node_modules\next\dist\bin\next dev
pause
