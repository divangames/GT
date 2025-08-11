@echo off
chcp 65001 >nul
echo ========================================
echo    ОБНОВЛЕНИЕ КАТАЛОГА АВТОМОБИЛЕЙ
echo ========================================
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
    exit /b 1
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
echo Нажмите любую клавишу для закрытия...
pause >nul
