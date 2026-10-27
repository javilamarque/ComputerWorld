@echo off
setlocal
cd /d "%~dp0"
if not exist server.mjs (
 echo Copia este archivo dentro de la carpeta Computerworld, junto a server.mjs.
 pause
 exit /b 1
)
echo Reinstalando dependencias de Computerworld. Los datos y las fotos se conservan.
call npm ci --include=dev --no-fund
if errorlevel 1 (
 echo No se pudo completar la reparacion. Conserva el mensaje de error.
 pause
 exit /b 1
)
node -e "console.log('Vite disponible:',require.resolve('vite'))"
if errorlevel 1 (
 echo No se pudo encontrar Vite. Envia una foto del error.
 pause
 exit /b 1
)
echo.
echo Reparacion terminada. Ahora abre INICIAR.bat
pause
