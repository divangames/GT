#!/usr/bin/env python3
"""
Скрипт для быстрого обновления данных автомобилей
Запускайте этот скрипт каждый раз, когда добавляете новые папки с автомобилями
"""

import subprocess
import sys
import os

def main():
    print("🔄 Обновление данных автомобилей...")
    
    # Проверяем, существует ли основной скрипт
    if not os.path.exists('generate_cars_data.py'):
        print("❌ Файл generate_cars_data.py не найден!")
        return
    
    try:
        # Запускаем генерацию данных
        result = subprocess.run([sys.executable, 'generate_cars_data.py'], 
                              capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode == 0:
            print("✅ Данные автомобилей успешно обновлены!")
            print(result.stdout)
        else:
            print("❌ Ошибка при обновлении данных:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    main()
