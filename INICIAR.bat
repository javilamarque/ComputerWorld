@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
 echo Primero ejecuta INSTALAR.bat
 pause
 exit /b 1
)
echo Iniciando Computerworld en http://127.0.0.1:5173
start "" "http://127.0.0.1:5173"
call npm run dev
pause
