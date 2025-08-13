// Система аутентификации пользователей
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.settings = {};
        this.init();
    }

    // Инициализация системы
    async init() {
        try {
            await this.loadUsers();
            this.checkSession();
            this.setupEventListeners();
            console.log('Система аутентификации инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации системы аутентификации:', error);
        }
    }

    // Загрузка пользователей из файла
    async loadUsers() {
        try {
            // Сначала проверяем localStorage для сохраненных данных пользователей
            const savedUsersData = localStorage.getItem('gt7_users');
            if (savedUsersData) {
                const data = JSON.parse(savedUsersData);
                this.users = data.users || [];
                this.settings = data.settings || {};
                console.log('Пользователи загружены из localStorage:', this.users.length);
                return;
            }

            // Если в localStorage нет данных, загружаем из статического файла
            const response = await fetch('users/users.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить данные пользователей');
            }
            const data = await response.json();
            this.users = data.users || [];
            this.settings = data.settings || {};
            console.log('Пользователи загружены из файла:', this.users.length);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            // Создаем базового администратора если файл не найден
            this.users = [{
                id: "admin_001",
                username: "Deliane",
                email: "deliane@admin.com",
                password: "airsugar666",
                avatar: null,
                role: "admin",
                created_at: "2025-01-27T00:00:00.000Z",
                last_login: null
            }];
            this.settings = {
                max_file_size: 1048576, // 1MB
                allowed_avatar_types: ["jpg", "jpeg", "png", "gif"],
                session_timeout: 3600000
            };
            console.log('Создан базовый администратор');
        }
    }

    // Сохранение пользователей в файл
    async saveUsers() {
        try {
            const data = {
                users: this.users,
                settings: this.settings
            };
            
            // В реальном проекте здесь был бы запрос к серверу
            // Для демонстрации сохраняем в localStorage
            localStorage.setItem('gt7_users', JSON.stringify(data));
            console.log('Пользователи сохранены');
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
        }
    }

    // Регистрация нового пользователя
    async register(userData) {
        try {
            // Проверяем, что пользователь не существует
            const existingUser = this.users.find(user => 
                user.username === userData.username || 
                user.email === userData.email
            );

            if (existingUser) {
                throw new Error('Пользователь с таким логином или email уже существует');
            }

            // Создаем нового пользователя
            const newUser = {
                id: `user_${Date.now()}`,
                username: userData.username,
                email: userData.email,
                password: userData.password,
                avatar: userData.avatar || null,
                role: 'user',
                created_at: new Date().toISOString(),
                last_login: null
            };

            console.log('Создаем пользователя с аватаром:', {
                username: newUser.username,
                email: newUser.email,
                hasAvatar: !!newUser.avatar,
                avatarLength: newUser.avatar ? newUser.avatar.length : 0
            });

            this.users.push(newUser);
            console.log('Пользователь добавлен в массив. Всего пользователей:', this.users.length);
            
            await this.saveUsers();
            
            // Проверяем, что пользователь действительно сохранен
            const savedData = localStorage.getItem('gt7_users');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Данные сохранены в localStorage. Пользователей в сохраненных данных:', parsedData.users.length);
            }

            console.log('Пользователь зарегистрирован:', newUser.username);
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, error: error.message };
        }
    }

    // Вход пользователя
    async login(username, password) {
        try {
            console.log('Попытка входа:', username, 'Пользователей в системе:', this.users.length);
            console.log('Доступные пользователи:', this.users.map(u => ({ username: u.username, role: u.role })));
            
            const user = this.users.find(u => 
                (u.username === username || u.email === username) && 
                u.password === password
            );

            if (!user) {
                console.log('Пользователь не найден. Проверяем каждого:');
                this.users.forEach(u => {
                    console.log(`- ${u.username}: username=${u.username === username}, email=${u.email === username}, password=${u.password === password}`);
                });
                throw new Error('Неверный логин или пароль');
            }

            // Обновляем время последнего входа
            user.last_login = new Date().toISOString();
            await this.saveUsers();

            // Сохраняем сессию
            this.currentUser = user;
            this.saveSession();

            console.log('Пользователь вошел:', user.username);
            return { success: true, user: user };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: error.message };
        }
    }

    // Выход пользователя
    logout() {
        this.currentUser = null;
        this.clearSession();
        console.log('Пользователь вышел');
        this.updateUI();
    }

    // Проверка сессии
    checkSession() {
        const session = localStorage.getItem('gt7_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                // Убеждаемся, что пользователи загружены из localStorage
                const savedUsersData = localStorage.getItem('gt7_users');
                if (savedUsersData) {
                    const data = JSON.parse(savedUsersData);
                    this.users = data.users || [];
                    this.settings = data.settings || {};
                }
                
                const user = this.users.find(u => u.id === sessionData.userId);
                if (user) {
                    this.currentUser = user;
                    console.log('Сессия восстановлена для:', user.username, 'аватар:', user.avatar ? 'есть' : 'нет');
                } else {
                    console.log('Пользователь сессии не найден, очищаем сессию');
                    this.clearSession();
                }
            } catch (error) {
                console.error('Ошибка восстановления сессии:', error);
                this.clearSession();
            }
        }
    }

    // Сохранение сессии
    saveSession() {
        if (this.currentUser) {
            const sessionData = {
                userId: this.currentUser.id,
                timestamp: Date.now()
            };
            localStorage.setItem('gt7_session', JSON.stringify(sessionData));
        }
    }

    // Очистка сессии
    clearSession() {
        localStorage.removeItem('gt7_session');
    }

    // Проверка прав администратора
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обновляем UI сразу после инициализации
        this.updateUI();
        this.setupAuthModals();
    }

    // Настройка модальных окон авторизации
    setupAuthModals() {
        // Кнопки открытия модальных окон
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Обработчики форм
        this.setupLoginForm();
        this.setupRegisterForm();
        
        // Настройка предварительного просмотра аватара
        this.setupAvatarPreview();
    }

    // Настройка формы входа
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
    }

    // Настройка формы регистрации
    setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }
    }

    // Обработка входа
    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        const result = await this.login(username, password);
        if (result.success) {
            this.showNotification('Вход выполнен успешно!', 'success');
            this.closeLoginModal();
            this.updateUI();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

            // Обработка регистрации
        async handleRegister() {
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const avatarFile = document.getElementById('registerAvatar').files[0];

            // Валидация
            if (!username || !email || !password || !confirmPassword) {
                this.showNotification('Заполните все обязательные поля', 'error');
                return;
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showNotification('Введите корректный email адрес', 'error');
                return;
            }

        if (password !== confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        // Обработка аватара
        let avatarData = null;
        if (avatarFile) {
            console.log('Начинаем загрузку аватара:', avatarFile.name);
            try {
                avatarData = await this.uploadAvatar(avatarFile);
                console.log('Аватар успешно загружен, размер данных:', avatarData ? avatarData.length : 0);
            } catch (error) {
                console.error('Ошибка при загрузке аватара:', error);
                this.showNotification('Ошибка при загрузке аватара: ' + error.message, 'error');
                return;
            }
        }

        const userData = {
            username,
            email,
            password,
            avatar: avatarData
        };

        const result = await this.register(userData);
        if (result.success) {
            this.showNotification('Регистрация выполнена успешно! Аватар сохранен в браузере.', 'success');
            this.closeRegisterModal();
            // Автоматически входим после регистрации
            await this.login(username, password);
            this.updateUI();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    // Загрузка аватара
    async uploadAvatar(file) {
        try {
            console.log('Проверяем файл аватара:', file.name, 'размер:', file.size, 'тип:', file.type);
            
            // Проверяем размер файла (1MB = 1048576 bytes)
            const maxSize = 1048576; // 1MB
            if (file.size > maxSize) {
                throw new Error('Файл слишком большой. Максимальный размер: 1MB');
            }

            // Проверяем тип файла
            const fileExtension = file.name.split('.').pop().toLowerCase();
            console.log('Расширение файла:', fileExtension);
            console.log('Разрешенные типы:', this.settings.allowed_avatar_types);
            
            if (!this.settings.allowed_avatar_types.includes(fileExtension)) {
                throw new Error('Неподдерживаемый тип файла. Разрешены: jpg, jpeg, png, gif');
            }

            // Создаем data URL для сохранения аватара
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('Файл успешно прочитан, создаем data URL');
                    const dataUrl = e.target.result;
                    console.log('Data URL создан, длина:', dataUrl.length);
                    resolve(dataUrl);
                };
                reader.onerror = (error) => {
                    console.error('Ошибка FileReader:', error);
                    reject(new Error('Ошибка чтения файла'));
                };
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            throw error;
        }
    }

    // Показ модального окна входа
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрытие модального окна входа
    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Очищаем форму
            document.getElementById('loginForm').reset();
        }
    }

    // Показ модального окна регистрации
    showRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрытие модального окна регистрации
    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Очищаем форму
            document.getElementById('registerForm').reset();
        }
    }

    // Обновление интерфейса
    updateUI() {
        const authSection = document.getElementById('authSection');
        const userSection = document.getElementById('userSection');

        if (this.isAuthenticated()) {
            // Показываем информацию о пользователе
            if (authSection) authSection.style.display = 'none';
            if (userSection) {
                userSection.style.display = 'block';
                this.updateUserDisplay();
            }
        } else {
            // Показываем кнопки авторизации
            if (authSection) authSection.style.display = 'block';
            if (userSection) userSection.style.display = 'none';
        }
    }

    // Обновление отображения пользователя
    updateUserDisplay() {
        const usernameElement = document.getElementById('userDisplayName');
        const avatarElement = document.getElementById('userAvatar');
        const userInitial = document.getElementById('userInitial');
        const adminAddCar = document.getElementById('adminAddCar');
        const adminUserList = document.getElementById('adminUserList');

        if (usernameElement) {
            usernameElement.textContent = this.currentUser.username;
        }

        if (avatarElement && userInitial) {
            console.log('Обновление аватара для пользователя:', this.currentUser.username);
            console.log('Аватар пользователя:', this.currentUser.avatar);
            console.log('Тип аватара:', typeof this.currentUser.avatar);
            console.log('Длина аватара:', this.currentUser.avatar ? this.currentUser.avatar.length : 0);
            
            // Проверяем, есть ли аватар
            if (this.currentUser.avatar && this.currentUser.avatar.startsWith('data:')) {
                // Если есть аватар (data URL), показываем изображение
                console.log('Показываем изображение аватара');
                avatarElement.style.backgroundImage = `url(${this.currentUser.avatar})`;
                avatarElement.style.backgroundSize = 'cover';
                avatarElement.style.backgroundPosition = 'center';
                avatarElement.classList.add('has-image');
                userInitial.style.display = 'none';
            } else {
                // Если нет аватара, показываем первую букву никнейма
                const firstLetter = this.currentUser.username.charAt(0).toUpperCase();
                console.log('Показываем первую букву:', firstLetter);
                avatarElement.style.backgroundImage = 'none';
                avatarElement.classList.remove('has-image');
                userInitial.style.display = 'flex';
                userInitial.textContent = firstLetter;
                userInitial.style.color = 'white'; // Явно устанавливаем цвет
            }
        }

        // Показываем админ-кнопки для администраторов
        if (adminAddCar) {
            if (this.isAdmin()) {
                adminAddCar.style.display = 'flex';
            } else {
                adminAddCar.style.display = 'none';
            }
        }

        if (adminUserList) {
            if (this.isAdmin()) {
                adminUserList.style.display = 'flex';
            } else {
                adminUserList.style.display = 'none';
            }
        }
    }

    // Показ уведомлений
    showNotification(message, type = 'info') {
        // Используем существующую функцию showNotification если она есть
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Простое уведомление
            alert(message);
        }
    }

    // Настройка предварительного просмотра аватара
    setupAvatarPreview() {
        const avatarInput = document.getElementById('registerAvatar');
        const avatarPreview = document.getElementById('avatarPreview');
        
        if (avatarInput && avatarPreview) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('Выбран файл аватара:', file.name, 'размер:', file.size);
                    
                    // Проверяем тип файла
                    if (!file.type.startsWith('image/')) {
                        this.showNotification('Пожалуйста, выберите изображение', 'error');
                        return;
                    }
                    
                    // Проверяем размер файла (1MB)
                    const maxSize = 1048576; // 1MB
                    if (file.size > maxSize) {
                        this.showNotification('Файл слишком большой. Максимальный размер: 1MB', 'error');
                        return;
                    }
                    
                    // Создаем предварительный просмотр
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        console.log('Предварительный просмотр создан');
                        avatarPreview.src = e.target.result;
                        avatarPreview.style.display = 'block';
                    };
                    reader.onerror = () => {
                        console.error('Ошибка чтения файла для предварительного просмотра');
                        this.showNotification('Ошибка чтения файла', 'error');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
}

// Инициализация системы аутентификации
let authSystem;

// Функция инициализации
function initAuthSystem() {
    if (!authSystem) {
        authSystem = new AuthSystem();
        window.authSystem = authSystem;
    }
}

// Инициализируем при загрузке DOM
document.addEventListener('DOMContentLoaded', initAuthSystem);
