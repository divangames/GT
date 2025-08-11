@echo off
chcp 65001 >nul
title Обновление каталога Gran Turismo 7

:menu
cls
echo ========================================
echo    КАТАЛОГ АВТОМОБИЛЕЙ GRAN TURISMO 7
echo    Версия 1.4.0 - 19.12.2024
echo ========================================
echo.
echo Выберите действие:
echo.
echo [1] Обновить данные и запустить сервер
echo [2] Только обновить данные
echo [3] Только запустить сервер
echo [4] Остановить сервер
echo [5] Проверить статус сервера
echo [6] Открыть сайт в браузере
echo [0] Выход
echo.
set /p choice="Введите номер (0-6): "

if "%choice%"=="1" goto update_and_start
if "%choice%"=="2" goto update_only
if "%choice%"=="3" goto start_only
if "%choice%"=="4" goto stop_server
if "%choice%"=="5" goto check_status
if "%choice%"=="6" goto open_browser
if "%choice%"=="0" goto exit
goto menu

:update_and_start
echo.
echo [1/3] Останавливаю локальный сервер...
taskkill /f /im python.exe >nul 2>&1
echo ✓ Сервер остановлен

echo.
echo [2/3] Обновляю данные автомобилей...
python generate_cars_data.py
if %errorlevel% equ 0 (
    echo ✓ Данные автомобилей обновлены
) else (
    echo ✗ Ошибка при обновлении данных
    pause
    goto menu
)

echo.
echo [3/3] Запускаю локальный сервер...
start "Gran Turismo 7 Catalog" python -m http.server 8000
echo ✓ Сервер запущен на http://localhost:8000

echo.
echo ========================================
echo    ОБНОВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!
echo ========================================
echo.
echo Сайт доступен по адресу: http://localhost:8000
echo.
pause
goto menu

:update_only
echo.
echo [1/1] Обновляю данные автомобилей...
python generate_cars_data.py
if %errorlevel% equ 0 (
    echo ✓ Данные автомобилей обновлены
) else (
    echo ✗ Ошибка при обновлении данных
)
echo.
pause
goto menu

:start_only
echo.
echo [1/1] Запускаю локальный сервер...
taskkill /f /im python.exe >nul 2>&1
start "Gran Turismo 7 Catalog" python -m http.server 8000
echo ✓ Сервер запущен на http://localhost:8000
echo.
pause
goto menu

:stop_server
echo.
echo [1/1] Останавливаю локальный сервер...
taskkill /f /im python.exe >nul 2>&1
echo ✓ Сервер остановлен
echo.
pause
goto menu

:check_status
echo.
echo [1/1] Проверяю статус сервера...
netstat -an | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo ✓ Сервер запущен на порту 8000
    echo   Адрес: http://localhost:8000
) else (
    echo ✗ Сервер не запущен
)
echo.
pause
goto menu

:open_browser
echo.
echo [1/1] Открываю сайт в браузере...
start http://localhost:8000
echo ✓ Браузер открыт
echo.
pause
goto menu

:exit
echo.
echo До свидания!
timeout /t 2 >nul
exit
