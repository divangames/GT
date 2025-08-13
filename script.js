// Функция для правильного склонения слова "автомобиль"
function getCarWordForm(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'автомобилей';
    }
    
    if (lastDigit === 1) {
        return 'автомобиль';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'автомобиля';
    } else {
        return 'автомобилей';
    }
}

// Глобальные переменные
let carsData = [];
let currentCarIndex = 0;
let currentSlideIndex = 0;
let slideInterval = null;
let filteredCars = [];
let searchTerm = '';
let activeFilters = {
    brand: '',
    category: '',
    drivetrain: '',
    year: '',
    sortBy: 'name'
};

// Переменные для сравнения
let compareMode = false;
let firstCarForCompare = null;

// Звуковые эффекты
let hoverSound = null;
let openSound = null;
let startSound = null;
let soundsEnabled = true;

// Инициализация звуков
function initSounds() {
    try {
        hoverSound = new Audio('sound/hover.mp3');
        hoverSound.volume = 1.0;
        hoverSound.preload = 'auto';
        
        openSound = new Audio('sound/open.mp3');
        openSound.volume = 1.0;
        openSound.preload = 'auto';
        
        startSound = new Audio('sound/start.mp3');
        startSound.volume = 1.0;
        startSound.preload = 'auto';
        
        console.log('Звуки инициализированы');
    } catch (error) {
        console.warn('Не удалось инициализировать звуки:', error);
        soundsEnabled = false;
    }
}

// Функция для воспроизведения стартового звука
function playStartSound() {
    if (soundsEnabled && startSound) {
        try {
            startSound.currentTime = 0;
            startSound.play().catch(error => {
                console.warn('Не удалось воспроизвести стартовый звук:', error);
            });
        } catch (error) {
            console.warn('Ошибка воспроизведения стартового звука:', error);
        }
    }
}

// Функция для управления прелоадером
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    // Воспроизводим стартовый звук
    playStartSound();
    
    // ИЗМЕНИТЬ ВРЕМЯ ПРЕЛОАДЕРА ЗДЕСЬ (в миллисекундах)
    // 5000 = 5 секунд, 10000 = 10 секунд, 15000 = 15 секунд
    const preloaderDuration = 2500;
    
    // Скрываем прелоадер через указанное время
    setTimeout(() => {
        preloader.classList.add('hidden');
        
        // Удаляем прелоадер из DOM после анимации
        setTimeout(() => {
            preloader.remove();
        }, 800);
    }, preloaderDuration);
}

// Воспроизведение звука при наведении
function playHoverSound() {
    if (soundsEnabled && hoverSound) {
        try {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(error => {
                console.warn('Не удалось воспроизвести звук наведения:', error);
            });
        } catch (error) {
            console.warn('Ошибка воспроизведения звука наведения:', error);
        }
    }
}

// Воспроизведение звука открытия модального окна
function playOpenSound() {
    if (soundsEnabled && openSound) {
        try {
            openSound.currentTime = 0;
            openSound.play().catch(error => {
                console.warn('Не удалось воспроизвести звук открытия:', error);
            });
        } catch (error) {
            console.warn('Ошибка воспроизведения звука открытия:', error);
        }
    }
}

// Настройка звуковых эффектов для элементов
function setupSoundEffects() {
    // Звуки наведения для карточек автомобилей
    const carCards = document.querySelectorAll('.car-card, .brand-card');
    carCards.forEach(card => {
        card.addEventListener('mouseenter', playHoverSound);
    });
    
    // Звуки наведения для кнопок
    const buttons = document.querySelectorAll('button, .btn, .search-toggle-btn, .filter-menu-btn, .close-btn, .close-instructions-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', playHoverSound);
    });
    
    // Звуки наведения для ссылок
    const links = document.querySelectorAll('a, .logo-link');
    links.forEach(link => {
        link.addEventListener('mouseenter', playHoverSound);
    });
    
    // Звуки наведения для элементов навигации
    const navItems = document.querySelectorAll('.nav-item, .slider-dot, .slider-nav button');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', playHoverSound);
    });
    
    console.log('Звуковые эффекты настроены');
}

// Функция показа инструкции
function showInstructions() {
    // Воспроизводим звук открытия модального окна
    playOpenSound();
    
    const instructionsHTML = `
        <div class="instructions-modal">
            <div class="instructions-content">
                <div class="instructions-header">
                    <h2>Инструкция по добавлению автомобилей</h2>
                    <button class="close-instructions-btn" onclick="closeInstructions()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="instructions-body">
                    <div class="instruction-section">
                        <h3>📁 Структура папок</h3>
                        <p>Для добавления нового автомобиля создайте следующую структуру:</p>
                        <div class="folder-structure">
                            <pre>GT/
├── images/
│   └── cars/
│       ├── [Марка автомобиля]/
│       │   ├── [Логотип марки].png (или .jpg)
│       │   └── [Модель автомобиля]/
│       │           ├── preview.jpg (или .png) - превью автомобиля
│       │           ├── info.txt - информация об автомобиле
│       │           └── screenshots/
│       │               ├── carXXXX_1_01-XXXXX.jpg
│       │               ├── carXXXX_2_01-XXXXX.jpg
│       │               └── carXXXX_3_01-XXXXX.jpg</pre>
                        </div>
                    </div>
                    
                    <div class="instruction-section">
                        <h3>📝 Пример структуры для Abarth 500</h3>
                        <div class="folder-structure">
                            <pre>GT/
├── images/
│   └── cars/
│       ├── Abarth/
│       │   ├── Abarth.png
│       │   └── 500/
│       │       ├── preview.jpg
│       │       ├── info.txt
│       │       └── screenshots/
│       │           ├── car1234_1_01-XXXXX.jpg
│       │           ├── car1234_2_01-XXXXX.jpg
│       │           └── car1234_3_01-XXXXX.jpg</pre>
                        </div>
                    </div>
                    
                    <div class="instruction-section">
                        <h3>📄 Формат файла info.txt</h3>
                        <p>Файл должен содержать информацию в следующем формате:</p>
                        <div class="code-example">
                            <pre>Название
Abarth 500

Макс. мощность
135 л.с.

Макс. крутящий момент
206 Н⋅м

Масса
1050 кг

Привод
FF

Год выпуска
2009

Категория
Гр. N

Описание
Компактный спортивный автомобиль...</pre>
                        </div>
                    </div>
                    
                    <div class="instruction-section">
                        <h3>🖼️ Требования к изображениям</h3>
                        <ul>
                            <li><strong>Превью:</strong> Файл должен называться <code>preview.jpg</code> или <code>preview.png</code></li>
                            <li><strong>Скриншоты:</strong> Файлы должны иметь формат <code>carXXXX_X_XX-XXXXX.jpg</code></li>
                            <li><strong>Логотип марки:</strong> Разместите в папке марки с названием марки</li>
                        </ul>
                    </div>
                    
                    <div class="instruction-section">
                        <h3>🔄 Обновление данных</h3>
                        <p>После добавления новых автомобилей:</p>
                        <ol>
                            <li>Запустите файл <code>update_cars.bat</code> для автоматического обновления</li>
                            <li>Или выполните команду: <code>python generate_cars_data.py</code></li>
                            <li>Обновите страницу в браузере</li>
                        </ol>
                    </div>
                    
                    <div class="instruction-section">
                        <h3>⚠️ Важные замечания</h3>
                        <ul>
                            <li>Используйте только латинские символы в названиях папок</li>
                            <li>Файл info.txt должен быть в кодировке UTF-8</li>
                            <li>Изображения должны быть в форматах JPG или PNG</li>
                            <li>Названия файлов не должны содержать специальные символы</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', instructionsHTML);
    
    // Добавляем обработчик для закрытия по клику вне модального окна
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('instructions-modal')) {
            closeInstructions();
        }
    });
    
    // Добавляем обработчик для закрытия по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeInstructions();
        }
    });
}

// Функция закрытия инструкции
function closeInstructions() {
    const instructionsModal = document.querySelector('.instructions-modal');
    if (instructionsModal) {
        instructionsModal.remove();
    }
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализирую приложение...');
    
    // Инициализируем звуки
    initSounds();
    
    // Инициализируем прелоадер
    initPreloader();
    
    // Добавляем тестовое сообщение в контейнер
    const brandsContainer = document.getElementById('brandsContainer');
    if (brandsContainer) {
        brandsContainer.innerHTML = '<p style="text-align: center; padding: 50px; color: #666; font-size: 18px;">Загрузка автомобилей...</p>';
        console.log('Добавлено сообщение о загрузке в brandsContainer');
    } else {
        console.error('brandsContainer не найден!');
        return;
    }
    
    console.log('Начинаю загрузку данных...');
    loadCarsData();
    
    // Инициализируем остальные функции только если элементы существуют
    try {
        setupMobileMenu();
        setupModalEvents();
        setupFilters();
        setupToggleFilters();
        
        // Настройка кнопки "Наверх"
        window.addEventListener('scroll', toggleScrollToTopButton);
        
        // Обновление информации в футере
        updateFooterInfo();
        
        // Настраиваем звуковые эффекты после загрузки данных
        setTimeout(() => {
            setupSoundEffects();
        }, 1000);
    } catch (error) {
        console.warn('Некоторые элементы не найдены, но это не критично:', error);
    }
    
    console.log('Инициализация завершена');
});

// Загрузка данных автомобилей
async function loadCarsData() {
    try {
        console.log('Загружаю данные автомобилей...');
        const response = await fetch('cars_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        carsData = await response.json();
        console.log('Данные загружены:', carsData.length, 'автомобилей');
        
        if (!Array.isArray(carsData)) {
            throw new Error('Данные не являются массивом');
        }
        
        filteredCars = [...carsData];
        console.log('Фильтрованные автомобили инициализированы:', filteredCars.length);
        
        populateFilters();
        renderBrandsCatalog();
        
        // Обновляем информацию в футере
        updateFooterInfo();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        const brandsContainer = document.getElementById('brandsContainer');
        if (brandsContainer) {
            brandsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Ошибка загрузки данных</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// Рендеринг каталога по брендам
function renderBrandsCatalog() {
    console.log('=== НАЧАЛО РЕНДЕРИНГА КАТАЛОГА ===');
    const brandsContainer = document.getElementById('brandsContainer');
    
    if (!brandsContainer) {
        console.error('brandsContainer не найден в renderBrandsCatalog!');
        return;
    }
    
    console.log('Рендеринг каталога. Фильтрованных автомобилей:', filteredCars.length);
    console.log('Первые 3 автомобиля:', filteredCars.slice(0, 3));
    
    if (!filteredCars || filteredCars.length === 0) {
        console.log('Нет автомобилей для отображения');
        brandsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Автомобили не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
                <button class="clear-filters-btn" onclick="clearAllFilters()">
                    <i class="fas fa-times"></i>
                    Очистить фильтры
                </button>
            </div>
        `;
        return;
    }
    
    // Группируем автомобили по брендам
    const brands = {};
    filteredCars.forEach(car => {
        if (!brands[car.brand]) {
            brands[car.brand] = {
                logo: car.brand_logo,
                cars: []
            };
        }
        brands[car.brand].cars.push(car);
    });
    
    console.log('Сгруппировано брендов:', Object.keys(brands).length);
    
    // Сортируем бренды по алфавиту (игнорируя регистр)
    const sortedBrands = Object.keys(brands).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ru'));
    
    // Создаем HTML для каждого бренда
    const brandsHTML = sortedBrands.map(brand => {
        const brandData = brands[brand];
        const carsHTML = brandData.cars.map(car => `
            <div class="car-card" onclick="handleCarCardClick(${car.id})">
                <div class="car-image">
                    <img src="${car.image}" alt="${car.name}" onerror="this.src='https://via.placeholder.com/200x140/f0f0f0/999?text=Нет+изображения'">
                </div>
                <div class="car-name">${car.name}</div>
            </div>
        `).join('');
        
        return `
            <div class="brand-section">
                <div class="brand-header">
                    <div class="brand-logo">
                        <img src="${brandData.logo}" alt="${brand}" onerror="this.src='https://via.placeholder.com/45x45/f0f0f0/999?text=${brand.charAt(0)}'">
                    </div>
                    <div class="brand-info">
                        <div class="brand-name">${brand}</div>
                        <div class="brand-count">${brandData.cars.length} ${getCarWordForm(brandData.cars.length)}</div>
                    </div>
                </div>
                <div class="cars-grid">
                    ${carsHTML}
                </div>
            </div>
        `;
    }).join('');
    
    brandsContainer.innerHTML = brandsHTML;
    console.log('Каталог отрендерен');
    console.log('HTML контент добавлен в brandsContainer');
    
    // Настраиваем звуковые эффекты для новых карточек автомобилей
    setupSoundEffects();
    
    console.log('=== КОНЕЦ РЕНДЕРИНГА КАТАЛОГА ===');
}

// Открытие модального окна с деталями автомобиля
function openCarModal(carId) {
    const carIndex = carsData.findIndex(c => c.id === carId);
    if (carIndex === -1) return;
    
    // Воспроизводим звук открытия модального окна
    playOpenSound();
    
    currentCarIndex = carIndex;
    currentSlideIndex = 0;
    updateModalContent();
    document.getElementById('carModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Запускаем автоматическое переключение слайдера
    startSlideInterval();
}

// Обновление содержимого модального окна
function updateModalContent() {
    const car = carsData[currentCarIndex];
    if (!car) return;
    
    // Обновляем заголовок
    document.getElementById('modalBrand').textContent = car.brand;
    document.getElementById('modalModel').textContent = car.name;
    document.getElementById('modalBrandLogo').src = car.brand_logo;
    
    // Обновляем описание
    document.getElementById('modalDescription').textContent = car.description;
    document.getElementById('modalFullDescription').textContent = getFullDescription(car);
    
    // Обновляем заголовок спецификаций
    const specHeader = `${car.category || 'Gr.N'} ${car.pp || ''}`.trim();
    document.getElementById('modalSpecHeader').textContent = specHeader;
    
    // Обновляем спецификации
    document.getElementById('modalDisplacement').textContent = car.displacement || 'N/A';
    document.getElementById('modalPower').textContent = car.power || 'N/A';
    document.getElementById('modalWeight').textContent = car.weight || 'N/A';
    document.getElementById('modalLength').textContent = car.dimensions.length || 'N/A';
    document.getElementById('modalHeight').textContent = car.dimensions.height || 'N/A';
    document.getElementById('modalDrivetrain').textContent = car.drivetrain || 'N/A';
    document.getElementById('modalTorque').textContent = car.torque || 'N/A';
    document.getElementById('modalAspiration').textContent = car.aspiration || 'N/A';
    document.getElementById('modalWidth').textContent = car.dimensions.width || 'N/A';
    
    // Обновляем слайдер скриншотов
    updateScreenshotsSlider();
}

// Обновление слайдера скриншотов
function updateScreenshotsSlider() {
    const car = carsData[currentCarIndex];
    const container = document.getElementById('screenshotsContainer');
    const progressContainer = document.getElementById('sliderProgress');
    
    if (!car || !car.screenshots || car.screenshots.length === 0) {
        // Если нет скриншотов, показываем превью автомобиля
        container.innerHTML = `
            <div class="screenshot-slide" onclick="expandImage(this)">
                <img src="${car.image}" alt="${car.name}" onerror="this.src='https://via.placeholder.com/800x450/f0f0f0/999?text=Нет+изображения'">
            </div>
        `;
        progressContainer.innerHTML = '';
        return;
    }
    
    // Создаем слайды для скриншотов
    const slidesHTML = car.screenshots.map((screenshot, index) => `
        <div class="screenshot-slide" onclick="expandImage(this)">
            <img src="${screenshot}" alt="Скриншот ${index + 1}" onerror="this.src='https://via.placeholder.com/800x450/f0f0f0/999?text=Скриншот+${index + 1}'">
        </div>
    `).join('');
    
    // Создаем круги прогресса
    const progressHTML = car.screenshots.map((_, index) => `
        <div class="progress-circle" onclick="goToSlide(${index})" data-slide="${index}"></div>
    `).join('');
    
    container.innerHTML = slidesHTML;
    progressContainer.innerHTML = progressHTML;
    
    // Обновляем позицию слайдера
    updateSliderPosition();
}

// Обновление прогресс-бара слайдера
function updateSliderProgress() {
    const car = carsData[currentCarIndex];
    const progressCircles = document.querySelectorAll('.progress-circle');
    
    if (!car || !car.screenshots || car.screenshots.length === 0) return;
    
    progressCircles.forEach((circle, index) => {
        circle.classList.remove('active', 'completed');
        
        if (index < currentSlideIndex) {
            // Завершенные слайды
            circle.classList.add('completed');
        } else if (index === currentSlideIndex) {
            // Текущий слайд
            circle.classList.add('active');
        }
    });
}

// Увеличение изображения при клике
function expandImage(slideElement) {
    const img = slideElement.querySelector('img');
    if (!img) return;
    
    // Воспроизводим звук открытия модального окна
    playOpenSound();
    
    // Создаем полноэкранное изображение
    const expandedSlide = document.createElement('div');
    expandedSlide.className = 'screenshot-slide expanded';
    expandedSlide.innerHTML = `
        <img src="${img.src}" alt="${img.alt}">
    `;
    
    // Добавляем в body
    document.body.appendChild(expandedSlide);
    document.body.style.overflow = 'hidden';
    
    // Закрытие при клике
    expandedSlide.addEventListener('click', function() {
        document.body.removeChild(expandedSlide);
        document.body.style.overflow = 'auto';
    });
    
    // Закрытие по Escape
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(expandedSlide);
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Обновление позиции слайдера
function updateSliderPosition() {
    const container = document.getElementById('screenshotsContainer');
    
    if (container) {
        container.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }
    
    // Обновляем прогресс-бар
    updateSliderProgress();
}

// Переход к конкретному слайду
function goToSlide(index) {
    const car = carsData[currentCarIndex];
    if (!car || !car.screenshots || index >= car.screenshots.length) return;
    
    currentSlideIndex = index;
    updateSliderPosition();
    
    // Перезапускаем интервал
    restartSlideInterval();
}

// Предыдущий слайд
function prevSlide() {
    const car = carsData[currentCarIndex];
    if (!car || !car.screenshots) return;
    
    currentSlideIndex = currentSlideIndex === 0 ? car.screenshots.length - 1 : currentSlideIndex - 1;
    updateSliderPosition();
    restartSlideInterval();
}

// Следующий слайд
function nextSlide() {
    const car = carsData[currentCarIndex];
    if (!car || !car.screenshots) return;
    
    currentSlideIndex = (currentSlideIndex + 1) % car.screenshots.length;
    updateSliderPosition();
}

// Запуск автоматического переключения
function startSlideInterval() {
    stopSlideInterval(); // Останавливаем предыдущий интервал
    
    const car = carsData[currentCarIndex];
    if (!car || !car.screenshots || car.screenshots.length === 0) return;
    
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // 5 секунд на слайд
}

// Остановка автоматического переключения
function stopSlideInterval() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// Перезапуск интервала
function restartSlideInterval() {
    stopSlideInterval();
    startSlideInterval();
}

// Получение полного описания автомобиля
function getFullDescription(car) {
    if (car.description && car.description.length > 100) {
        return car.description;
    }
    
    // Если описание короткое, добавляем дополнительную информацию
    let fullDesc = car.description || '';
    
    if (car.year) {
        fullDesc += ` Год выпуска: ${car.year}.`;
    }
    
    if (car.power && car.power !== 'N/A') {
        fullDesc += ` Мощность двигателя: ${car.power}.`;
    }
    
    if (car.weight && car.weight !== 'N/A') {
        fullDesc += ` Масса автомобиля: ${car.weight}.`;
    }
    
    if (car.drivetrain && car.drivetrain !== 'N/A') {
        fullDesc += ` Тип привода: ${car.drivetrain}.`;
    }
    
    return fullDesc || 'Подробное описание автомобиля недоступно.';
}

// Навигация между автомобилями
function navigateCar(direction) {
    const newIndex = currentCarIndex + direction;
    
    if (newIndex < 0) {
        currentCarIndex = carsData.length - 1;
    } else if (newIndex >= carsData.length) {
        currentCarIndex = 0;
    } else {
        currentCarIndex = newIndex;
    }
    
    currentSlideIndex = 0; // Сбрасываем индекс слайда
    updateModalContent();
    
    // Перезапускаем интервал для нового автомобиля
    restartSlideInterval();
}

// Настройка мобильного меню
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
}

// Настройка событий модального окна
function setupModalEvents() {
    // Основное модальное окно автомобиля
    const carModal = document.getElementById('carModal');
    if (carModal) {
        carModal.addEventListener('click', function(e) {
            if (e.target === carModal) {
                closeModal();
            }
        });
    }
    
    // Модальное окно марок автомобилей
    const brandsModal = document.getElementById('brandsModal');
    if (brandsModal) {
        brandsModal.addEventListener('click', function(e) {
            if (e.target === brandsModal) {
                closeBrandsModal();
            }
        });
    }
    
    // Модальное окно сравнения
    const compareModal = document.getElementById('compareModal');
    if (compareModal) {
        compareModal.addEventListener('click', function(e) {
            if (e.target === compareModal) {
                closeCompareModal();
            }
        });
    }
    
    // Модальное окно контактов
    const contactsModal = document.getElementById('contactsModal');
    if (contactsModal) {
        contactsModal.addEventListener('click', function(e) {
            if (e.target === contactsModal) {
                closeContacts();
            }
        });
    }
    
    // Модальные окна авторизации
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                authSystem.closeLoginModal();
            }
        });
    }
    
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
            if (e.target === registerModal) {
                authSystem.closeRegisterModal();
            }
        });
    }
    
    const addCarModal = document.getElementById('addCarModal');
    if (addCarModal) {
        addCarModal.addEventListener('click', function(e) {
            if (e.target === addCarModal) {
                closeAddCarModal();
            }
        });
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Закрываем активное модальное окно
            if (carModal && carModal.style.display === 'block') {
                closeModal();
            } else if (brandsModal && brandsModal.style.display === 'block') {
                closeBrandsModal();
            } else if (compareModal && compareModal.style.display === 'block') {
                closeCompareModal();
            } else if (contactsModal && contactsModal.style.display === 'flex') {
                closeContacts();
            } else if (loginModal && loginModal.style.display === 'block') {
                authSystem.closeLoginModal();
            } else if (registerModal && registerModal.style.display === 'block') {
                authSystem.closeRegisterModal();
            } else if (addCarModal && addCarModal.style.display === 'block') {
                closeAddCarModal();
            }
        }
        
        // Навигация стрелками только для основного модального окна
        if (carModal && carModal.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                navigateCar(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCar(1);
            }
        }
    });
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('carModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Останавливаем автоматическое переключение
    stopSlideInterval();
}

// Настройка фильтров
function setupFilters() {
    console.log('Настраиваю фильтры...');
    
    try {
        // Поиск
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        if (searchInput && clearSearch) {
            searchInput.addEventListener('input', function() {
                searchTerm = this.value.toLowerCase();
                console.log('Поисковый запрос:', searchTerm);
                clearSearch.style.display = searchTerm ? 'block' : 'none';
                applyFilters();
            });
            
            clearSearch.addEventListener('click', function() {
                searchInput.value = '';
                searchTerm = '';
                this.style.display = 'none';
                console.log('Поиск очищен');
                applyFilters();
            });
        }
        
        // Фильтры
        const filterSelects = ['brandFilter', 'categoryFilter', 'drivetrainFilter', 'yearFilter', 'sortBy'];
        filterSelects.forEach(filterId => {
            const select = document.getElementById(filterId);
            if (select) {
                console.log('Найден фильтр:', filterId);
                select.addEventListener('change', function() {
                    const filterKey = filterId.replace('Filter', '').replace('sort', 'sortBy');
                    activeFilters[filterKey] = this.value;
                    console.log('Фильтр изменен:', filterKey, '=', this.value);
                    applyFilters();
                });
            }
        });
        
        // Очистка фильтров
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
            console.log('Кнопка очистки фильтров настроена');
        }
        
        // Обработчик клавиши Escape для закрытия фильтров
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const filtersSection = document.querySelector('.filters-section');
                const filterMenuBtn = document.querySelector('.filter-menu-btn');
                
                if (filtersSection && filtersSection.classList.contains('show')) {
                    filtersSection.classList.remove('show');
                    if (filterMenuBtn) {
                        filterMenuBtn.innerHTML = '<i class="fas fa-filter"></i> Фильтры';
                    }
                    setTimeout(() => {
                        filtersSection.style.display = 'none';
                    }, 300);
                }
            }
        });
        
        console.log('Фильтры настроены успешно');
        
    } catch (error) {
        console.error('Ошибка при настройке фильтров:', error);
    }
}

// Заполнение фильтров данными
function populateFilters() {
    console.log('Заполняю фильтры данными...');
    
    if (!carsData || carsData.length === 0) {
        console.warn('Нет данных для заполнения фильтров');
        return;
    }
    
    const brands = [...new Set(carsData.map(car => car.brand).filter(Boolean))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ru'));
    const categories = [...new Set(carsData.map(car => car.category).filter(Boolean))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ru'));
    const drivetrains = [...new Set(carsData.map(car => car.drivetrain).filter(Boolean))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ru'));
    const years = [...new Set(carsData.map(car => car.year).filter(Boolean))].sort((a, b) => b - a);
    
    console.log('Найдены бренды:', brands);
    console.log('Найдены категории:', categories);
    console.log('Найдены приводы:', drivetrains);
    console.log('Найдены годы:', years);
    
    // Заполняем селекты
    populateSelect('brandFilter', brands);
    populateSelect('categoryFilter', categories);
    populateSelect('drivetrainFilter', drivetrains);
    populateSelect('yearFilter', years);
    
    console.log('Фильтры заполнены');
}

// Заполнение селекта опциями
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error('Селект не найден:', selectId);
        return;
    }
    
    console.log('Заполняю селект:', selectId, 'опциями:', options);
    
    // Сохраняем текущее значение
    const currentValue = select.value;
    
    // Очищаем существующие опции (кроме первой)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Добавляем новые опции
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Восстанавливаем значение
    select.value = currentValue;
    
    console.log('Селект заполнен:', selectId, 'количество опций:', select.children.length);
}

// Применение фильтров
function applyFilters() {
    console.log('Применяю фильтры...');
    console.log('Поисковый запрос:', searchTerm);
    console.log('Активные фильтры:', activeFilters);
    
    filteredCars = carsData.filter(car => {
        // Поиск по названию
        if (searchTerm && !car.name.toLowerCase().includes(searchTerm) && 
            !car.brand.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Фильтр по бренду
        if (activeFilters.brand && car.brand !== activeFilters.brand) {
            return false;
        }
        
        // Фильтр по категории
        if (activeFilters.category && car.category !== activeFilters.category) {
            return false;
        }
        
        // Фильтр по приводу
        if (activeFilters.drivetrain && car.drivetrain !== activeFilters.drivetrain) {
            return false;
        }
        
        // Фильтр по году
        if (activeFilters.year && car.year !== parseInt(activeFilters.year)) {
            return false;
        }
        
        return true;
    });
    
    console.log('Отфильтровано автомобилей:', filteredCars.length);
    
    // Сортировка
    sortCars();
    
    // Обновляем отображение
    renderBrandsCatalog();
    updateResultsCount();
    updateFiltersSection();
}

// Сортировка автомобилей
function sortCars() {
    const sortBy = activeFilters.sortBy;
    
    filteredCars.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'ru');
            case 'brand':
                return a.brand.toLowerCase().localeCompare(b.brand.toLowerCase(), 'ru');
            case 'year':
                return (b.year || 0) - (a.year || 0);
            case 'power':
                const powerA = parseInt(a.power) || 0;
                const powerB = parseInt(b.power) || 0;
                return powerB - powerA;
            default:
                return 0;
        }
    });
}

// Обновление счетчика результатов
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    const resultsWord = document.getElementById('resultsWord');
    if (resultsCount) {
        resultsCount.textContent = filteredCars.length;
    }
    if (resultsWord) {
        resultsWord.textContent = getCarWordForm(filteredCars.length);
    }
}

// Обновление стилей секции фильтров
function updateFiltersSection() {
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
        const hasActiveFilters = searchTerm || 
            activeFilters.brand || 
            activeFilters.category || 
            activeFilters.drivetrain || 
            activeFilters.year;
        
        filtersSection.classList.toggle('has-results', hasActiveFilters);
    }
}

// Очистка всех фильтров
function clearAllFilters() {
    // Очищаем поиск
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchTerm = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // Очищаем фильтры
    const filterSelects = ['brandFilter', 'categoryFilter', 'drivetrainFilter', 'yearFilter'];
    filterSelects.forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select) {
            select.value = '';
        }
    });
    
    // Сбрасываем активные фильтры
    activeFilters = {
        brand: '',
        category: '',
        drivetrain: '',
        year: '',
        sortBy: 'name'
    };
    
    // Применяем изменения
    applyFilters();
}

// Настройка переключения фильтров
function setupToggleFilters() {
    const filtersSection = document.querySelector('.filters-section');
    const filterMenuBtn = document.querySelector('.filter-menu-btn');
    
    if (filtersSection) {
        console.log('Переключение фильтров настроено');
        
        // Инициализируем состояние кнопки фильтров
        if (filterMenuBtn) {
            // По умолчанию фильтры скрыты, поэтому кнопка должна показывать "Фильтры"
            filterMenuBtn.innerHTML = '<i class="fas fa-filter"></i> Фильтры';
        }
    }
}

// Функция переключения фильтров из меню
function toggleFiltersFromMenu() {
    const filtersSection = document.querySelector('.filters-section');
    const filterMenuBtn = document.querySelector('.filter-menu-btn');
    
    if (filtersSection && filterMenuBtn) {
        const isVisible = filtersSection.classList.contains('show');
        
        if (isVisible) {
            // Скрываем секцию фильтров с анимацией
            filtersSection.classList.remove('show');
            filterMenuBtn.innerHTML = '<i class="fas fa-filter"></i> Фильтры';
            setTimeout(() => {
                filtersSection.style.display = 'none';
            }, 300);
        } else {
            // Показываем секцию фильтров с анимацией
            filtersSection.style.display = 'block';
            filterMenuBtn.innerHTML = '<i class="fas fa-times"></i> Скрыть';
            setTimeout(() => {
                filtersSection.classList.add('show');
            }, 10);
            // Прокручиваем к фильтрам
            filtersSection.scrollIntoView({ behavior: 'smooth' });
            // Фокусируемся на поле поиска
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 500);
            }
        }
    }
}

// Функция прокрутки наверх
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Функция показа/скрытия кнопки "Наверх"
function toggleScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }
}

// Функция обновления информации в футере
function updateFooterInfo() {
    const totalCarsElement = document.getElementById('totalCars');
    const totalCarsWordElement = document.getElementById('totalCarsWord');
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    if (totalCarsElement && carsData) {
        totalCarsElement.textContent = carsData.length;
    }
    
    if (totalCarsWordElement && carsData) {
        totalCarsWordElement.textContent = getCarWordForm(carsData.length);
    }
    
    if (lastUpdateElement) {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        lastUpdateElement.textContent = now.toLocaleDateString('ru-RU', options);
    }
}

// Функция прокрутки к фильтрам
function scrollToFilters() {
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
        // Показываем фильтры, если они скрыты
        if (!filtersSection.classList.contains('show')) {
            filtersSection.style.display = 'block';
            setTimeout(() => {
                filtersSection.classList.add('show');
            }, 10);
        }
        filtersSection.scrollIntoView({ behavior: 'smooth' });
        // Фокусируемся на поле поиска
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 500);
        }
    }
}

// Функция переключения поиска
function toggleSearch() {
    const filtersSection = document.querySelector('.filters-section');
    
    if (filtersSection) {
        const isVisible = filtersSection.classList.contains('show');
        
        if (isVisible) {
            // Скрываем секцию фильтров с анимацией
            filtersSection.classList.remove('show');
            setTimeout(() => {
                filtersSection.style.display = 'none';
            }, 300);
        } else {
            // Показываем секцию фильтров с анимацией
            filtersSection.style.display = 'block';
            setTimeout(() => {
                filtersSection.classList.add('show');
            }, 10);
            // Прокручиваем к фильтрам
            filtersSection.scrollIntoView({ behavior: 'smooth' });
            // Фокусируемся на поле поиска
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 500);
            }
        }
    }
}

// Функция показа модального окна с марками автомобилей
function showBrandsModal() {
    // Воспроизводим звук открытия модального окна
    playOpenSound();
    
    const brandsModal = document.getElementById('brandsModal');
    const brandsGrid = document.getElementById('brandsGrid');
    
    if (brandsModal && brandsGrid) {
        // Показываем модальное окно
        brandsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Проверяем, загружены ли данные
        if (!carsData || carsData.length === 0) {
            // Показываем сообщение о загрузке
            brandsGrid.innerHTML = `
                <div style="text-align: center; padding: 50px; color: rgba(255, 255, 255, 0.8);">
                    <div style="font-size: 24px; margin-bottom: 20px;">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <div style="font-size: 18px;">Загрузка марок автомобилей...</div>
                </div>
            `;
            
            // Ждем загрузки данных и обновляем содержимое
            const checkDataInterval = setInterval(() => {
                if (carsData && carsData.length > 0) {
                    clearInterval(checkDataInterval);
                    populateBrandsModal();
                }
            }, 100);
            
            // Таймаут на случай, если данные не загрузятся
            setTimeout(() => {
                clearInterval(checkDataInterval);
                if (!carsData || carsData.length === 0) {
                    brandsGrid.innerHTML = `
                        <div style="text-align: center; padding: 50px; color: rgba(255, 255, 255, 0.8);">
                            <div style="font-size: 24px; margin-bottom: 20px;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div style="font-size: 18px;">Ошибка загрузки данных</div>
                        </div>
                    `;
                }
            }, 5000);
        } else {
            // Данные уже загружены, сразу заполняем
            populateBrandsModal();
        }
        
        // Настраиваем звуковые эффекты для новых элементов
        setupSoundEffects();
    }
}

// Функция заполнения модального окна марками
function populateBrandsModal() {
    const brandsGrid = document.getElementById('brandsGrid');
    
    if (!brandsGrid || !carsData || carsData.length === 0) {
        return;
    }
    
    // Группируем автомобили по брендам
    const brands = {};
    carsData.forEach(car => {
        if (!brands[car.brand]) {
            brands[car.brand] = {
                logo: car.brand_logo,
                cars: []
            };
        }
        brands[car.brand].cars.push(car);
    });
    
    // Сортируем бренды по алфавиту (игнорируя регистр)
    const sortedBrands = Object.keys(brands).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ru'));
    
    // Создаем HTML для каждой марки
    const brandsHTML = sortedBrands.map(brand => {
        const brandData = brands[brand];
        return `
            <div class="brand-item" onclick="selectBrand('${brand}')">
                <div class="brand-item-logo">
                    <img src="${brandData.logo}" alt="${brand}" onerror="this.src='https://via.placeholder.com/80x60/f0f0f0/999?text=${brand.charAt(0)}'">
                </div>
                <div class="brand-item-name">${brand}</div>
                <div class="brand-item-count">${brandData.cars.length} ${getCarWordForm(brandData.cars.length)}</div>
            </div>
        `;
    }).join('');
    
    brandsGrid.innerHTML = brandsHTML;
    
    // Добавляем задержку для анимации элементов
    const brandItems = brandsGrid.querySelectorAll('.brand-item');
    brandItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
    });
}

// Функция закрытия модального окна с марками
function closeBrandsModal() {
    const brandsModal = document.getElementById('brandsModal');
    if (brandsModal) {
        brandsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Функция выбора марки и прокрутки к ней
function selectBrand(brandName) {
    // Закрываем модальное окно
    closeBrandsModal();
    
    // Находим секцию с выбранной маркой
    const brandSections = document.querySelectorAll('.brand-section');
    let targetSection = null;
    
    brandSections.forEach(section => {
        const brandNameElement = section.querySelector('.brand-name');
        if (brandNameElement && brandNameElement.textContent === brandName) {
            targetSection = section;
        }
    });
    
    if (targetSection) {
        // Прокручиваем к секции с выбранной маркой
        targetSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Добавляем подсветку секции
        targetSection.style.boxShadow = '0 0 30px rgba(100, 181, 246, 0.3)';
        targetSection.style.border = '2px solid rgba(100, 181, 246, 0.5)';
        
        // Убираем подсветку через 3 секунды
        setTimeout(() => {
            targetSection.style.boxShadow = '';
            targetSection.style.border = '';
        }, 3000);
    }
}

// Функция показа модального окна контактов
function showContacts() {
    // Воспроизводим звук открытия модального окна
    playOpenSound();
    
    const contactsModal = document.getElementById('contactsModal');
    if (contactsModal) {
        contactsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Функция закрытия модального окна контактов
function closeContacts() {
    const contactsModal = document.getElementById('contactsModal');
    if (contactsModal) {
        contactsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Функции сравнения автомобилей

// Начать процесс сравнения
function startCompare() {
    if (compareMode) {
        // Если уже в режиме сравнения, показываем модальное окно
        showCompareModal();
        return;
    }
    
    const currentCar = carsData[currentCarIndex];
    if (!currentCar) return;
    
    // Сохраняем первый автомобиль
    firstCarForCompare = currentCar;
    compareMode = true;
    
    // Закрываем текущее модальное окно
    closeModal();
    
    // Показываем уведомление
    showNotification('Выберите второй автомобиль для сравнения', 'info');
    
    // Добавляем класс для выделения карточек
    document.body.classList.add('compare-mode');
}

// Показать модальное окно сравнения
function showCompareModal() {
    if (!firstCarForCompare) return;
    
    const compareModal = document.getElementById('compareModal');
    if (!compareModal) return;
    
    // Загружаем данные первого автомобиля
    loadCompareCarData(firstCarForCompare, 1);
    
    // Загружаем данные второго автомобиля (текущий)
    const currentCar = carsData[currentCarIndex];
    if (currentCar) {
        loadCompareCarData(currentCar, 2);
    }
    
    // Показываем модальное окно
    compareModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Воспроизводим звук
    playOpenSound();
}

// Закрыть модальное окно сравнения
function closeCompareModal() {
    const compareModal = document.getElementById('compareModal');
    if (compareModal) {
        compareModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Сбрасываем режим сравнения
    compareMode = false;
    firstCarForCompare = null;
    document.body.classList.remove('compare-mode');
}

// Загрузить данные автомобиля для сравнения
function loadCompareCarData(car, carNumber) {
    // Загружаем изображение
    const imageElement = document.getElementById(`compareCar${carNumber}Image`);
    if (imageElement) {
        imageElement.src = car.image;
        imageElement.alt = car.name;
    }
    
    // Загружаем название
    const nameElement = document.getElementById(`compareCar${carNumber}Name`);
    if (nameElement) {
        nameElement.textContent = car.name;
    }
    
    // Загружаем бренд
    const brandElement = document.getElementById(`compareCar${carNumber}Brand`);
    if (brandElement) {
        brandElement.textContent = car.brand;
    }
    
    // Загружаем характеристики
    const specsElement = document.getElementById(`compareCar${carNumber}Specs`);
    if (specsElement) {
        specsElement.innerHTML = generateCompareSpecsHTML(car, carNumber);
    }
}

// Генерировать HTML для характеристик сравнения
function generateCompareSpecsHTML(car, carNumber) {
    const specs = [
        { label: 'Объем двигателя', value: car.displacement || 'N/A', unit: 'cc' },
        { label: 'Макс. мощность', value: car.power || 'N/A', unit: 'hp' },
        { label: 'Макс. крутящий момент', value: car.torque || 'N/A', unit: 'Nm' },
        { label: 'Масса', value: car.weight || 'N/A', unit: 'kg' },
        { label: 'Длина', value: car.length || 'N/A', unit: 'mm' },
        { label: 'Ширина', value: car.width || 'N/A', unit: 'mm' },
        { label: 'Высота', value: car.height || 'N/A', unit: 'mm' },
        { label: 'Привод', value: car.drivetrain || 'N/A', unit: '' },
        { label: 'Наддув', value: car.aspiration || 'N/A', unit: '' }
    ];
    
    return specs.map(spec => {
        const displayValue = spec.unit ? `${spec.value} ${spec.unit}` : spec.value;
        const differenceBadge = carNumber === 2 ? generateDifferenceBadge(spec, car) : '';
        return `
            <div class="compare-spec-item">
                <span class="spec-label">${spec.label}</span>
                <div class="spec-value">
                    <span>${displayValue}</span>
                    ${differenceBadge}
                </div>
            </div>
        `;
    }).join('');
}

// Генерировать значок разницы
function generateDifferenceBadge(spec, currentCar) {
    if (!firstCarForCompare) return '';
    
    const firstValue = parseNumericValue(firstCarForCompare[spec.label.toLowerCase().replace(/[^a-z]/g, '')] || firstCarForCompare[getSpecKey(spec.label)]);
    const secondValue = parseNumericValue(currentCar[spec.label.toLowerCase().replace(/[^a-z]/g, '')] || currentCar[getSpecKey(spec.label)]);
    
    if (firstValue === null || secondValue === null) return '';
    
    const difference = secondValue - firstValue;
    const percentage = firstValue !== 0 ? ((difference / firstValue) * 100) : 0;
    
    if (difference === 0) {
        return '<span class="spec-difference equal">=</span>';
    } else if (difference > 0) {
        return `<span class="spec-difference better">+${Math.abs(difference).toFixed(1)}</span>`;
    } else {
        return `<span class="spec-difference worse">-${Math.abs(difference).toFixed(1)}</span>`;
    }
}

// Получить ключ характеристики
function getSpecKey(label) {
    const keyMap = {
        'Объем двигателя': 'displacement',
        'Макс. мощность': 'power',
        'Макс. крутящий момент': 'torque',
        'Масса': 'weight',
        'Длина': 'length',
        'Ширина': 'width',
        'Высота': 'height',
        'Привод': 'drivetrain',
        'Наддув': 'aspiration'
    };
    return keyMap[label] || label.toLowerCase();
}

// Парсить числовое значение
function parseNumericValue(value) {
    if (!value || value === 'N/A') return null;
    
    // Извлекаем число из строки
    const numericMatch = value.toString().match(/[\d.,]+/);
    if (!numericMatch) return null;
    
    const numericValue = parseFloat(numericMatch[0].replace(',', '.'));
    return isNaN(numericValue) ? null : numericValue;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(35, 35, 35, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 15px 20px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        z-index: 10000;
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Обработчик клика по карточке в режиме сравнения
function handleCarCardClick(carId) {
    const carIndex = carsData.findIndex(c => c.id === carId);
    if (carIndex === -1) return;
    
    if (compareMode && firstCarForCompare) {
        // Если в режиме сравнения, открываем модальное окно сравнения
        currentCarIndex = carIndex;
        showCompareModal();
    } else {
        // Обычный режим - открываем модальное окно автомобиля
        openCarModal(carId);
    }
}

// Функции для работы с добавлением автомобилей (админ-панель)

// Показать модальное окно добавления автомобиля
function showAddCarModal() {
    if (!authSystem || !authSystem.isAdmin()) {
        showNotification('Доступ запрещен. Требуются права администратора.', 'error');
        return;
    }
    
    const modal = document.getElementById('addCarModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        playOpenSound();
    }
}

// Закрыть модальное окно добавления автомобиля
function closeAddCarModal() {
    const modal = document.getElementById('addCarModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Очищаем форму
        document.getElementById('addCarForm').reset();
    }
}

// Обработка формы добавления автомобиля
function setupAddCarForm() {
    const form = document.getElementById('addCarForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddCar();
        });
    }
}

// Обработка добавления автомобиля
async function handleAddCar() {
    if (!authSystem || !authSystem.isAdmin()) {
        showNotification('Доступ запрещен. Требуются права администратора.', 'error');
        return;
    }

    const formData = {
        brand: document.getElementById('addCarBrand').value,
        name: document.getElementById('addCarName').value,
        year: parseInt(document.getElementById('addCarYear').value),
        category: document.getElementById('addCarCategory').value,
        description: document.getElementById('addCarDescription').value,
        power: document.getElementById('addCarPower').value ? parseInt(document.getElementById('addCarPower').value) : null,
        weight: document.getElementById('addCarWeight').value ? parseInt(document.getElementById('addCarWeight').value) : null,
        drivetrain: document.getElementById('addCarDrivetrain').value,
        image: document.getElementById('addCarImage').files[0]
    };

    // Валидация
    if (!formData.brand || !formData.name || !formData.year || !formData.category || !formData.description) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    try {
        // В реальном проекте здесь была бы отправка данных на сервер
        // Для демонстрации создаем временный объект автомобиля
        const newCar = {
            id: `car_${Date.now()}`,
            brand: formData.brand,
            name: formData.name,
            full_name: `${formData.brand} ${formData.name}`,
            year: formData.year,
            category: formData.category,
            description: formData.description,
            power: formData.power ? `${formData.power} л.с.` : null,
            weight: formData.weight ? `${formData.weight} кг` : null,
            drivetrain: formData.drivetrain,
            image: formData.image ? URL.createObjectURL(formData.image) : 'https://via.placeholder.com/200x140/f0f0f0/999?text=Нет+изображения',
            brand_logo: `https://via.placeholder.com/45x45/f0f0f0/999?text=${formData.brand.charAt(0)}`,
            screenshots: [],
            displacement: null,
            torque: null,
            aspiration: null,
            dimensions: {
                length: null,
                width: null,
                height: null
            },
            pp: null,
            added_by: authSystem.getCurrentUser().username,
            added_at: new Date().toISOString()
        };

        // Добавляем автомобиль в массив данных
        carsData.push(newCar);
        
        // Обновляем отображение
        applyFilters();
        
        showNotification('Автомобиль успешно добавлен!', 'success');
        closeAddCarModal();
        
        console.log('Автомобиль добавлен:', newCar);
    } catch (error) {
        console.error('Ошибка добавления автомобиля:', error);
        showNotification('Ошибка при добавлении автомобиля', 'error');
    }
}

// Настройка обработчиков для админ-панели
function setupAdminPanel() {
    setupAddCarForm();
    
    // Обработчик для модального окна добавления автомобиля
    const addCarModal = document.getElementById('addCarModal');
    if (addCarModal) {
        addCarModal.addEventListener('click', function(e) {
            if (e.target === addCarModal) {
                closeAddCarModal();
            }
        });
    }
}

// Инициализация админ-панели при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupAdminPanel();
    
    // Инициализируем систему авторизации
    if (typeof initAuthSystem === 'function') {
        initAuthSystem();
    } else {
        console.log('Функция initAuthSystem не найдена, создаем систему напрямую');
        if (typeof AuthSystem !== 'undefined') {
            window.authSystem = new AuthSystem();
        }
    }
    
    // Настройка выпадающего меню пользователя
    setupUserDropdown();
});

// Функции для работы с выпадающим меню пользователя
function setupUserDropdown() {
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userDropdown');
        const userProfile = document.querySelector('.user-profile');
        
        if (dropdown && !dropdown.contains(e.target) && !userProfile.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function showProfileEdit() {
    // Закрываем выпадающее меню
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Показываем модальное окно редактирования профиля
    if (window.adminSystem) {
        adminSystem.showProfileEdit();
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Система администратора не загружена', 'error');
        } else {
            alert('Система администратора не загружена');
        }
    }
}

function showMyGarage() {
    // Закрываем выпадающее меню
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Показываем уведомление (в будущем можно создать страницу гаража)
    if (typeof showNotification === 'function') {
        showNotification('Функция "Мой гараж" будет добавлена в следующем обновлении', 'info');
    } else {
        alert('Функция "Мой гараж" будет добавлена в следующем обновлении');
    }
}

function showUserList() {
    // Закрываем выпадающее меню
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Показываем список пользователей
    if (window.adminSystem) {
        adminSystem.showUserList();
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Система администратора не загружена', 'error');
        } else {
            alert('Система администратора не загружена');
        }
    }
}
