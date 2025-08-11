@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    Gran Turismo 7 - Каталог автомобилей
echo ========================================
echo.
echo Версия: 1.9.6
echo.
echo Обновление данных автомобилей...
echo.

REM Останавливаем сервер если он запущен
taskkill /f /im python.exe >nul 2>&1

REM Генерируем данные автомобилей
python generate_cars_data.py

if %errorlevel% neq 0 (
    echo.
    echo Ошибка при генерации данных!
    echo Убедитесь, что Python установлен и доступен в PATH
    echo.
    pause
    exit /b 1
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

REM Запускаем сервер
python -m http.server 8000

pause
