# Tutu Icons Inserter

Плагин для Figma, позволяющий вставлять иконки из шрифта TutuIcons в текстовые слои.

## Установка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-username/tutu-icon-inserter.git
   cd tutu-icon-inserter
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

## Разработка

1. Запустите сборку в режиме разработки (следит за изменениями файлов):
   ```bash
   npm run dev
   ```

2. В Figma выберите "Plugins > Development > Import plugin from manifest..." и выберите файл `manifest.json` из папки `dist`.

## Сборка для продакшена

```bash
npm run build
```

Собранный плагин будет доступен в папке `dist`.

## Использование

1. Выберите текстовый слой в Figma
2. Запустите плагин
3. Найдите нужную иконку и нажмите на неё для вставки

## Лицензия

MIT
