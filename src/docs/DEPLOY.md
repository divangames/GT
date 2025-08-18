# 🚀 Быстрый деплой на GitHub Pages

## ✅ Готово к использованию

Ваш проект уже настроен и загружен на GitHub!

### 🔗 Ссылки
- **Репозиторий**: https://github.com/divangames/GT
- **Сайт**: https://divangames.github.io/GT/ (после настройки Pages)

## ⚡ Быстрая настройка GitHub Pages

1. Откройте: https://github.com/divangames/GT/settings/pages
2. В разделе **Source** выберите:
   - **Deploy from a branch**
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
3. Нажмите **Save**

## 🔄 Обновление сайта

```bash
git add .
git commit -m "Описание изменений"
git push origin main
```

Сайт автоматически обновится через 2-3 минуты!

## 📋 Что происходит автоматически

1. GitHub Actions запускается при каждом push
2. Генерируются данные автомобилей
3. Создается ветка gh-pages
4. Сайт обновляется на GitHub Pages

---

**Подробная инструкция**: [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)
