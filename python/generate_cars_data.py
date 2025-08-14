import os
import json
import re
from pathlib import Path
from datetime import datetime

def read_car_info(info_file_path):
    """Читает информацию об автомобиле из файла info.txt"""
    car_info = {
        'description': '',
        'category': '',
        'pp': '',
        'displacement': '',
        'drivetrain': '',
        'power': '',
        'torque': '',
        'weight': '',
        'aspiration': '',
        'length': '',
        'width': '',
        'height': ''
    }
    
    try:
        with open(info_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            # Первая строка - краткое описание
            if lines:
                car_info['description'] = lines[0].strip()
            
            # Парсим остальные строки
            for i, line in enumerate(lines):
                line = line.strip()
                
                # Ищем ключевые слова и берем следующую строку как значение
                if line == 'Гр. N' and i + 1 < len(lines):
                    car_info['category'] = lines[i + 1].strip()
                elif line.startswith('ТР'):
                    car_info['pp'] = line.replace('ТР', '').strip()
                    # Если нет отдельной категории, используем PP как категорию
                    if not car_info['category']:
                        car_info['category'] = 'Gr.N'
                elif line == 'Объем двигателя' and i + 1 < len(lines):
                    car_info['displacement'] = lines[i + 1].strip()
                elif line == 'Привод' and i + 1 < len(lines):
                    car_info['drivetrain'] = lines[i + 1].strip()
                elif line == 'Макс. мощность' and i + 1 < len(lines):
                    car_info['power'] = lines[i + 1].strip()
                elif line == 'Макс. крутящий момент' and i + 1 < len(lines):
                    car_info['torque'] = lines[i + 1].strip()
                elif line == 'Масса' and i + 1 < len(lines):
                    car_info['weight'] = lines[i + 1].strip()
                elif line == 'Наддув' and i + 1 < len(lines):
                    car_info['aspiration'] = lines[i + 1].strip()
                elif line == 'Длина' and i + 1 < len(lines):
                    car_info['length'] = lines[i + 1].strip()
                elif line == 'Ширина' and i + 1 < len(lines):
                    car_info['width'] = lines[i + 1].strip()
                elif line == 'Высота' and i + 1 < len(lines):
                    car_info['height'] = lines[i + 1].strip()
                    
    except Exception as e:
        print(f"Ошибка чтения файла {info_file_path}: {e}")
    
    return car_info

def get_car_images(car_folder):
    """Получает список изображений автомобиля"""
    preview_image = None
    screenshots = []
    
    for file in os.listdir(car_folder):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            file_path = f'images/cars/{os.path.basename(os.path.dirname(car_folder))}/{os.path.basename(car_folder)}/{file}'
            
            # Ищем превью (файл без дополнительных номеров в конце)
            if re.match(r'car\d+\.(jpg|jpeg|png)$', file, re.IGNORECASE):
                preview_image = file_path
            elif re.match(r'car\d+_\d+_\d+.*\.(jpg|jpeg|png)$', file, re.IGNORECASE):
                # Это скриншоты (формат carXXXX_X_XX-XXXXX.jpg)
                screenshots.append(file_path)
    
    return {
        'preview': preview_image,
        'screenshots': screenshots
    }

def get_brand_logo(brand_folder):
    """Получает путь к логотипу бренда"""
    for file in os.listdir(brand_folder):
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            return f'images/cars/{os.path.basename(brand_folder)}/{file}'
    return None

def parse_car_name(folder_name):
    """Парсит имя автомобиля из названия папки"""
    # Пример: "Abarth 595 SS '70" -> brand: "Abarth", name: "595 SS", year: "70"
    parts = folder_name.split(' ')
    if len(parts) >= 2:
        # Ищем год в конце (в кавычках)
        year_match = re.search(r"'(\d{2,4})$", folder_name)
        year = year_match.group(1) if year_match else ""
        
        # Убираем год из названия
        name_without_year = re.sub(r"'\d{2,4}$", "", folder_name).strip()
        
        return {
            'full_name': folder_name,
            'name_without_year': name_without_year,
            'year': year
        }
    return {
        'full_name': folder_name,
        'name_without_year': folder_name,
        'year': ""
    }

def determine_car_type(category, description):
    """Определяет тип автомобиля на основе категории и описания"""
    category_lower = category.lower()
    description_lower = description.lower()
    
    if 'gr.1' in category_lower or 'prototype' in description_lower:
        return 'hypercar'
    elif 'gr.2' in category_lower or 'gt500' in description_lower:
        return 'supercar'
    elif 'gr.3' in category_lower or 'gt3' in description_lower:
        return 'sports'
    elif 'gr.4' in category_lower or 'gt4' in description_lower:
        return 'sports'
    elif 'gr.b' in category_lower or 'rally' in description_lower:
        return 'rally'
    elif 'gr.x' in category_lower or 'concept' in description_lower:
        return 'concept'
    elif 'vintage' in description_lower or 'classic' in description_lower:
        return 'classic'
    else:
        return 'modern'

def scan_cars_directory():
    """Сканирует папку cars и создает JSON с данными автомобилей"""
    cars_data = []
    cars_dir = Path("images/cars")
    
    if not cars_dir.exists():
        print("Папка images/cars не найдена!")
        return []
    
    # Проходим по всем папкам брендов
    for brand_folder in cars_dir.iterdir():
        if brand_folder.is_dir():
            brand_name = brand_folder.name
            brand_logo = get_brand_logo(brand_folder)
            
            print(f"Обрабатываем бренд: {brand_name}")
            
            # Проходим по всем папкам моделей
            for model_folder in brand_folder.iterdir():
                if model_folder.is_dir():
                    car_info = parse_car_name(model_folder.name)
                    
                    # Читаем информацию из info.txt
                    info_file = model_folder / "info.txt"
                    car_details = {}
                    if info_file.exists():
                        car_details = read_car_info(info_file)
                    
                    # Получаем изображения автомобиля
                    car_images = get_car_images(model_folder)
                    
                    # Находим превью
                    preview_image = car_images['preview']
                    screenshots = car_images['screenshots']
                    
                    # Определяем тип автомобиля
                    car_type = determine_car_type(car_details.get('category', ''), car_details.get('description', ''))
                    
                    # Создаем объект автомобиля
                    car_data = {
                        'id': len(cars_data) + 1,
                        'brand': brand_name,
                        'name': car_info['full_name'],
                        'name_short': car_info['name_without_year'],
                        'year': car_info['year'],
                        'type': car_type,
                        'power': car_details.get('power', 'N/A'),
                        'torque': car_details.get('torque', 'N/A'), 
                        'weight': car_details.get('weight', 'N/A'),
                        'price': 'N/A',  # Цена не указана в info.txt
                        'image': preview_image,
                        'brand_logo': brand_logo,
                        'screenshots': screenshots,
                        'description': car_details.get('description', f'{car_info["full_name"]} - автомобиль от {brand_name}'),
                        'category': car_details.get('category', ''),
                        'pp': car_details.get('pp', ''),
                        'displacement': car_details.get('displacement', ''),
                        'drivetrain': car_details.get('drivetrain', ''),
                        'aspiration': car_details.get('aspiration', ''),
                        'dimensions': {
                            'length': car_details.get('length', ''),
                            'width': car_details.get('width', ''),
                            'height': car_details.get('height', '')
                        }
                    }
                    
                    cars_data.append(car_data)
                    print(f"  Добавлен: {brand_name} {car_info['full_name']}")
    
    return cars_data

def main():
    """Основная функция"""
    print("Сканирование папки images/cars...")
    
    # Загружаем предыдущие данные для сравнения
    previous_cars = []
    if os.path.exists('json/cars_data.json'):
        try:
            with open('json/cars_data.json', 'r', encoding='utf-8') as f:
                previous_cars = json.load(f)
            print(f"Загружено {len(previous_cars)} автомобилей из предыдущей версии")
        except Exception as e:
            print(f"Ошибка загрузки предыдущих данных: {e}")
    
    cars_data = scan_cars_directory()
    
    if cars_data:
        # Определяем новые автомобили
        new_cars = []
        if previous_cars:
            # Создаем множество идентификаторов предыдущих автомобилей
            previous_ids = set()
            for car in previous_cars:
                # Используем комбинацию бренда, названия и года как уникальный идентификатор
                car_id = f"{car['brand']}_{car['name']}_{car['year']}"
                previous_ids.add(car_id)
            
            # Находим новые автомобили
            for car in cars_data:
                car_id = f"{car['brand']}_{car['name']}_{car['year']}"
                if car_id not in previous_ids:
                    new_cars.append(car)
        else:
            # Если это первая генерация, все автомобили считаются новыми
            new_cars = cars_data
        
        # Сохраняем информацию о новых автомобилях
        update_info = {
            'total_cars': len(cars_data),
            'new_cars_count': len(new_cars),
            'last_update': datetime.now().isoformat(),
            'new_cars': [{'brand': car['brand'], 'name': car['name'], 'year': car['year']} for car in new_cars]
        }
        
        # Сохраняем в JSON файл
        os.makedirs('json', exist_ok=True)
        with open('json/cars_data.json', 'w', encoding='utf-8') as f:
            json.dump(cars_data, f, ensure_ascii=False, indent=2)
        
        # Сохраняем информацию об обновлении
        with open('json/update_info.json', 'w', encoding='utf-8') as f:
            json.dump(update_info, f, ensure_ascii=False, indent=2)
        
        print(f"\nНайдено {len(cars_data)} автомобилей")
        print(f"Новых автомобилей: {len(new_cars)}")
        print("Данные сохранены в файл json/cars_data.json")
        print("Информация об обновлении сохранена в json/update_info.json")
        
        if new_cars:
            print("\nНовые автомобили:")
            for car in new_cars:
                print(f"  {car['brand']} {car['name']}")
        
        # Выводим статистику по брендам
        brands = {}
        for car in cars_data:
            brand = car['brand']
            brands[brand] = brands.get(brand, 0) + 1
        
        print("\nСтатистика по брендам:")
        for brand, count in sorted(brands.items()):
            print(f"  {brand}: {count} автомобилей")
    else:
        print("Автомобили не найдены!")

if __name__ == "__main__":
    main()
