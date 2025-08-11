@echo off
chcp 65001 >nul
:menu
cls
echo.
echo ========================================
echo    Gran Turismo 7 - Каталог автомобилей
echo ========================================
echo.
echo Версия: 1.9.8
echo.
echo Выберите действие:
echo.
echo 1. Обновить данные автомобилей
echo 2. Запустить сервер
echo 3. Обновить данные и запустить сервер
echo 4. Остановить сервер
echo 5. Выход
echo.
set /p choice="Введите номер (1-5): "

if "%choice%"=="1" goto update
if "%choice%"=="2" goto server
if "%choice%"=="3" goto update_and_server
if "%choice%"=="4" goto stop_server
if "%choice%"=="5" goto exit
goto menu

:update
cls
echo.
echo Обновление данных автомобилей...
echo.
python generate_cars_data.py
if %errorlevel% neq 0 (
    echo.
    echo Ошибка при генерации данных!
    pause
    goto menu
)
echo.
echo Данные успешно обновлены!
pause
goto menu

:server
cls
echo.
echo Запуск локального сервера...
echo.
echo Откройте браузер и перейдите по адресу:
echo http://localhost:8000
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.
python -m http.server 8000
goto menu

:update_and_server
cls
echo.
echo Обновление данных автомобилей...
echo.
python generate_cars_data.py
if %errorlevel% neq 0 (
    echo.
    echo Ошибка при генерации данных!
    pause
    goto menu
)
echo.
echo Данные успешно обновлены!
echo.
echo Запуск локального сервера...
echo.
echo Откройте браузер и перейдите по адресу:
echo http://localhost:8000
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.
python -m http.server 8000
goto menu

:stop_server
cls
echo.
echo Остановка сервера...
taskkill /f /im python.exe >nul 2>&1
echo Сервер остановлен!
pause
goto menu

:exit
echo.
echo До свидания!
exit /b 0
