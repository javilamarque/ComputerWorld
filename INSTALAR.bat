@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Primero instala Node.js 24 LTS desde https://nodejs.org/en/download
 echo Despues cierra esta ventana y vuelve a abrir INSTALAR.bat
 pause
 exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 24 ? 0 : 1)"
if errorlevel 1 (
 echo Se necesita Node.js 24 o superior.
 pause
 exit /b 1
)
echo Instalando Computerworld. Se necesita internet en este paso.
call npm ci --include=dev --no-audit --no-fund
if errorlevel 1 (
 echo No se pudo completar la instalacion. Copia el mensaje de error para revisarlo.
 pause
 exit /b 1
)
echo.
echo Instalacion terminada. Ahora abre INICIAR.bat
pause
