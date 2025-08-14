// Система управления администратора
class AdminSystem {
    constructor() {
        this.users = [];
        this.init();
    }

    async init() {
        await this.loadUsers();
        this.setupEventListeners();
    }

    async loadUsers() {
        try {
            // Загружаем пользователей из localStorage (в реальном проекте - с сервера)
            const usersData = localStorage.getItem('gt7_users');
            if (usersData) {
                const data = JSON.parse(usersData);
                this.users = data.users || [];
                console.log('Пользователи загружены из localStorage:', this.users.length);
            } else {
                // Если нет данных, загружаем из authSystem
                if (window.authSystem) {
                    this.users = window.authSystem.users || [];
                    console.log('Пользователи загружены из authSystem:', this.users.length);
                }
            }
            
            // Синхронизируем с authSystem
            if (window.authSystem && this.users.length > 0) {
                window.authSystem.users = this.users;
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            this.users = [];
        }
    }

    async saveUsers() {
        try {
            const data = {
                users: this.users,
                settings: {
                    max_file_size: 1048576, // 1MB
                    allowed_avatar_types: ["jpg", "jpeg", "png", "gif"],
                    session_timeout: 3600000
                }
            };
            localStorage.setItem('gt7_users', JSON.stringify(data));
            
            // Обновляем данные в authSystem
            if (window.authSystem) {
                window.authSystem.users = this.users;
                window.authSystem.settings = data.settings;
                // Сохраняем также через authSystem для синхронизации
                if (typeof window.authSystem.saveUsers === 'function') {
                    await window.authSystem.saveUsers();
                } else {
                    // Фолбэк: вручную перезаписываем localStorage
                    try {
                        localStorage.setItem('gt7_users', JSON.stringify({ users: this.users, settings: window.authSystem.settings || data.settings }));
                    } catch (e) {
                        console.warn('Фолбэк сохранения пользователей не удался:', e);
                    }
                }

                // Если изменили роль текущего пользователя, обновляем UI
                const current = window.authSystem.getCurrentUser?.();
                if (current) {
                    const refreshed = this.users.find(u => u.id === current.id);
                    if (refreshed) {
                        window.authSystem.currentUser = refreshed;
                        window.authSystem.saveSession?.();
                        window.authSystem.updateUI?.();
                    }
                }
            }
            
            console.log('Пользователи сохранены в adminSystem:', this.users.length);
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
        }
    }

    setupEventListeners() {
        // Добавляем обработчики для админских функций
        this.setupUserListModal();
        this.setupProfileEditModal();
    }

    // Показать список пользователей (только для админов)
    showUserList() {
        if (!window.authSystem || !window.authSystem.isAdmin()) {
            this.showNotification('Доступ запрещен. Требуются права администратора.', 'error');
            return;
        }

        this.loadUsers();
        this.renderUserList();
        this.showUserListModal();
    }

    // Рендеринг списка пользователей
    renderUserList() {
        const userListContainer = document.getElementById('userListContainer');
        if (!userListContainer) return;

        userListContainer.innerHTML = '';

		this.users.forEach(user => {
			const currentUserId = window.authSystem?.getCurrentUser()?.id;
			const isSelf = user.id === currentUserId;
			const adminsCount = this.users.filter(u => u.role === 'admin').length;
			const isOnlyAdmin = user.role === 'admin' && adminsCount <= 1;
			const disableToggle = isSelf || isOnlyAdmin;
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <div class="user-card-header">
                    <div class="user-card-avatar">
                        ${user.avatar && user.avatar.startsWith('data:') 
                            ? `<img src="${user.avatar}" alt="${user.username}">` 
                            : `<span>${user.username.charAt(0).toUpperCase()}</span>`
                        }
                    </div>
                    <div class="user-card-info">
                        <h4>${user.username}</h4>
                        <p>${user.email || 'Email не указан'}</p>
                        <span class="user-role ${user.role}">${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
                    </div>
                </div>
                <div class="user-card-actions">
					<button class="btn-toggle-admin" onclick="adminSystem.toggleUserRole('${user.id}')" 
							${disableToggle ? 'disabled' : ''} title="${isSelf ? 'Нельзя изменять собственную роль' : (isOnlyAdmin ? 'Должен остаться хотя бы один администратор' : '')}">
                        ${user.role === 'admin' ? 'Убрать права админа' : 'Назначить админом'}
                    </button>
                    <button class="btn-delete-user" onclick="adminSystem.deleteUser('${user.id}')" 
                            ${user.id === window.authSystem?.getCurrentUser()?.id ? 'disabled' : ''}>
                        Удалить
                    </button>
                </div>
            `;
            userListContainer.appendChild(userCard);
        });
    }

    // Переключение роли пользователя
    async toggleUserRole(userId) {
        if (!window.authSystem || !window.authSystem.isAdmin()) {
            this.showNotification('Доступ запрещен.', 'error');
            return;
        }

        const user = this.users.find(u => u.id === userId);
        if (!user) {
            this.showNotification('Пользователь не найден.', 'error');
            return;
        }

        // Запрет менять собственную роль
        const currentUserId = window.authSystem.getCurrentUser()?.id;
        if (user.id === currentUserId) {
            this.showNotification('Нельзя менять собственную роль.', 'error');
            return;
        }

        // Должен оставаться хотя бы один администратор
        const adminsCount = this.users.filter(u => u.role === 'admin').length;
        if (user.role === 'admin' && adminsCount <= 1) {
            this.showNotification('Должен остаться хотя бы один администратор.', 'error');
            return;
        }

        user.role = user.role === 'admin' ? 'user' : 'admin';
        await this.saveUsers();
        this.renderUserList();
        
        this.showNotification(
            `Пользователь ${user.username} ${user.role === 'admin' ? 'назначен администратором' : 'лишен прав администратора'}.`, 
            'success'
        );
    }

    // Удаление пользователя
    async deleteUser(userId) {
        if (!window.authSystem || !window.authSystem.isAdmin()) {
            this.showNotification('Доступ запрещен.', 'error');
            return;
        }

        const user = this.users.find(u => u.id === userId);
        if (!user) {
            this.showNotification('Пользователь не найден.', 'error');
            return;
        }

        if (user.id === window.authSystem.getCurrentUser()?.id) {
            this.showNotification('Нельзя удалить свой аккаунт.', 'error');
            return;
        }

        if (confirm(`Вы уверены, что хотите удалить пользователя ${user.username}?`)) {
            this.users = this.users.filter(u => u.id !== userId);
            await this.saveUsers();
            this.renderUserList();
            this.showNotification(`Пользователь ${user.username} удален.`, 'success');
        }
    }

    // Показать модальное окно списка пользователей
    showUserListModal() {
        const modal = document.getElementById('userListModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрыть модальное окно списка пользователей
    closeUserListModal() {
        const modal = document.getElementById('userListModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Настройка модального окна списка пользователей
    setupUserListModal() {
        const modal = document.getElementById('userListModal');
        if (modal) {
            // Закрытие по клику вне модального окна
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeUserListModal();
                }
            });

            // Закрытие по ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    this.closeUserListModal();
                }
            });
        }
    }

    // Показать редактирование профиля
    showProfileEdit() {
        if (!window.authSystem || !window.authSystem.isAuthenticated()) {
            this.showNotification('Необходимо войти в систему.', 'error');
            return;
        }

        const currentUser = window.authSystem.getCurrentUser();
        this.populateProfileForm(currentUser);
        this.showProfileEditModal();
    }

    // Заполнить форму профиля данными пользователя
    populateProfileForm(user) {
        const usernameInput = document.getElementById('editUsername');
        const emailInput = document.getElementById('editEmail');
        const avatarPreview = document.getElementById('editAvatarPreview');
        const avatarInitial = document.getElementById('editAvatarInitial');
        const avatarInput = document.getElementById('editAvatar');

        if (usernameInput) usernameInput.value = user.username;
        if (emailInput) emailInput.value = user.email || '';
        
        if (avatarPreview && avatarInitial) {
            if (user.avatar && user.avatar.startsWith('data:')) {
                // Если есть аватар, показываем изображение
                avatarPreview.style.backgroundImage = `url(${user.avatar})`;
                avatarPreview.style.backgroundSize = 'cover';
                avatarPreview.style.backgroundPosition = 'center';
                avatarPreview.classList.add('has-image');
                avatarInitial.style.display = 'none';
            } else {
                // Если нет аватара, показываем первую букву
                avatarPreview.style.backgroundImage = 'none';
                avatarPreview.classList.remove('has-image');
                avatarInitial.style.display = 'flex';
                avatarInitial.textContent = user.username.charAt(0).toUpperCase();
                avatarInitial.style.color = 'white';
            }
        }

        // Настройка предварительного просмотра аватара
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Проверяем размер файла (1MB)
                    if (file.size > 1024 * 1024) {
                        this.showNotification('Файл слишком большой. Максимальный размер: 1MB', 'error');
                        return;
                    }

                    // Проверяем тип файла
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                    if (!allowedTypes.includes(file.type)) {
                        this.showNotification('Неподдерживаемый тип файла. Используйте JPG, PNG или GIF.', 'error');
                        return;
                    }

                    // Создаем предварительный просмотр
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (avatarPreview && avatarInitial) {
                            avatarPreview.style.backgroundImage = `url(${e.target.result})`;
                            avatarPreview.style.backgroundSize = 'cover';
                            avatarPreview.style.backgroundPosition = 'center';
                            avatarPreview.classList.add('has-image');
                            avatarInitial.style.display = 'none';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Сохранить изменения профиля
    async saveProfileChanges() {
        if (!window.authSystem || !window.authSystem.isAuthenticated()) {
            this.showNotification('Необходимо войти в систему.', 'error');
            return;
        }

        const username = document.getElementById('editUsername')?.value;
        const email = document.getElementById('editEmail')?.value;
        const currentPassword = document.getElementById('editCurrentPassword')?.value;
        const newPassword = document.getElementById('editNewPassword')?.value;
        const confirmPassword = document.getElementById('editConfirmPassword')?.value;
        const avatarFile = document.getElementById('editAvatar')?.files[0];

        if (!username || !email) {
            this.showNotification('Заполните все обязательные поля.', 'error');
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Введите корректный email адрес.', 'error');
            return;
        }

        const currentUser = window.authSystem.getCurrentUser();
        
        // Проверяем, не занят ли новый логин
        const existingUser = this.users.find(u => 
            u.username === username && u.id !== currentUser.id
        );
        if (existingUser) {
            this.showNotification('Пользователь с таким логином уже существует.', 'error');
            return;
        }

        // Проверяем пароль, если он меняется
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                this.showNotification('Новые пароли не совпадают.', 'error');
                return;
            }
            if (newPassword.length < 6) {
                this.showNotification('Новый пароль должен содержать минимум 6 символов.', 'error');
                return;
            }
            if (currentPassword !== currentUser.password) {
                this.showNotification('Неверный текущий пароль.', 'error');
                return;
            }
        }

        try {
            // Обновляем данные пользователя
            const userIndex = this.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].username = username;
                this.users[userIndex].email = email;
                
                if (newPassword) {
                    this.users[userIndex].password = newPassword;
                }

                // Обрабатываем новый аватар
                if (avatarFile) {
                    const avatarUrl = await this.uploadAvatar(avatarFile);
                    this.users[userIndex].avatar = avatarUrl;
                }

                await this.saveUsers();
                
                // Обновляем текущую сессию
                window.authSystem.currentUser = this.users[userIndex];
                window.authSystem.saveSession();
                window.authSystem.updateUI();

                this.showNotification('Профиль успешно обновлен! Аватар сохранен в браузере.', 'success');
                this.closeProfileEditModal();
            }
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            this.showNotification('Ошибка при обновлении профиля.', 'error');
        }
    }

    // Загрузка аватара
    async uploadAvatar(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    // Показать модальное окно редактирования профиля
    showProfileEditModal() {
        const modal = document.getElementById('profileEditModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрыть модальное окно редактирования профиля
    closeProfileEditModal() {
        const modal = document.getElementById('profileEditModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Настройка модального окна редактирования профиля
    setupProfileEditModal() {
        const modal = document.getElementById('profileEditModal');
        if (modal) {
            // Закрытие по клику вне модального окна
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProfileEditModal();
                }
            });

            // Закрытие по ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    this.closeProfileEditModal();
                }
            });
        }
    }

    // Показать уведомления
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Инициализация системы администратора
let adminSystem;

function initAdminSystem() {
    if (!adminSystem) {
        adminSystem = new AdminSystem();
        window.adminSystem = adminSystem;
    }
}

// Инициализируем при загрузке DOM
document.addEventListener('DOMContentLoaded', initAdminSystem);
