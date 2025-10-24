# Система учёта заявок для производства металлических дверей

Внутренняя веб-система учёта заявок для производства металлических дверей с канбан-планировщиком, управлением заказчиками, файлами и уведомлениями.

## 🚀 Возможности

- 📋 **Управление заявками** - Полный жизненный цикл заявок от создания до выдачи
- 🎯 **Канбан-планировщик** - Визуальный контроль этапов производства с drag-and-drop
- 👥 **Управление заказчиками** - Справочник клиентов с историей заявок
- 🔐 **RBAC система** - Гибкое управление ролями и правами доступа
- 📁 **Файловое хранилище** - Загрузка и управление документами и чертежами
- 💬 **Комментарии** - Внутренние и публичные комментарии к заявкам
- 🔔 **Уведомления** - Email, SMS и Telegram уведомления
- 📊 **История изменений** - Полный аудит всех действий в системе
- 🔗 **Внешний доступ** - Защищённые ссылки для заказчиков
- 🌙 **Темы оформления** - Светлая и тёмная тема интерфейса

## 🏗️ Архитектура

### Backend
- **NestJS** - Фреймворк для Node.js
- **PostgreSQL** - Основная база данных
- **Redis** - Кэширование и очереди
- **BullMQ** - Система очередей
- **TypeORM** - ORM для работы с базой данных
- **JWT** - Аутентификация
- **Puppeteer** - Генерация PDF

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **React Query** - Управление состоянием сервера
- **Zustand** - Управление состоянием клиента
- **React Hook Form** - Формы
- **DnD Kit** - Drag and Drop

### DevOps
- **Docker** - Контейнеризация
- **Docker Compose** - Орестрация

## 📋 Требования

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd door-manufacturing-system
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env
```

Отредактируйте `.env` файл с вашими настройками:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=door_manufacturing
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS Configuration (опционально)
SMS_API_KEY=your_sms_api_key
SMS_API_URL=https://api.sms-provider.com/send

# Telegram Configuration (опционально)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. Запуск с Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 4. Инициализация базы данных

```bash
# Запуск миграций
docker-compose exec backend npm run migration:run

# Заполнение начальными данными
docker-compose exec backend npm run seed
```

### 5. Доступ к приложению

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Документация**: http://localhost:3000/api/docs

## 👤 Учетные данные по умолчанию

После инициализации базы данных будут созданы следующие пользователи:

- **Администратор**: admin@example.com / admin123
- **Менеджер**: manager@example.com / manager123

## 🛠️ Разработка

### Локальная разработка

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

### Структура проекта

```
door-manufacturing-system/
├── backend/                 # NestJS приложение
│   ├── src/
│   │   ├── modules/        # Модули бизнес-логики
│   │   │   ├── auth/      # Аутентификация
│   │   │   ├── users/     # Пользователи
│   │   │   ├── customers/ # Заказчики
│   │   │   ├── orders/    # Заявки
│   │   │   ├── stages/    # Этапы
│   │   │   ├── files/     # Файлы
│   │   │   ├── comments/  # Комментарии
│   │   │   ├── notifications/ # Уведомления
│   │   │   └── history/  # История
│   │   ├── config/        # Конфигурация
│   │   ├── common/        # Общие утилиты
│   │   └── database/      # Настройки БД
│   ├── test/              # Тесты
│   └── Dockerfile
├── frontend/               # Next.js приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── hooks/         # React хуки
│   │   ├── services/      # API сервисы
│   │   ├── store/         # Управление состоянием
│   │   ├── types/         # TypeScript типы
│   │   └── utils/         # Утилиты
│   └── Dockerfile
├── docker-compose.yml      # Docker конфигурация
├── docker-compose.dev.yml   # Dev конфигурация
└── README.md
```

## 📝 API Документация

API документация доступна по адресу: http://localhost:3000/api/docs

Основные эндпоинты:

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `POST /api/auth/refresh` - Обновление токена

### Заявки
- `GET /api/orders` - Список заявок
- `POST /api/orders` - Создание заявки
- `GET /api/orders/:id` - Детали заявки
- `PATCH /api/orders/:id` - Обновление заявки
- `DELETE /api/orders/:id` - Удаление заявки

### Заказчики
- `GET /api/customers` - Список заказчиков
- `POST /api/customers` - Создание заказчика
- `GET /api/customers/:id` - Детали заказчика
- `PATCH /api/customers/:id` - Обновление заказчика

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
npm run test

# Frontend тесты
cd frontend
npm run test

# E2E тесты
npm run test:e2e
```

## 📦 Сборка и развертывание

### Production сборка

```bash
# Сборка образов
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Запуск в production режиме
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Ручное развертывание

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `NODE_ENV` | Режим работы | `development` |
| `PORT` | Порт backend | `3000` |
| `DB_HOST` | Хост БД | `postgres` |
| `DB_PORT` | Порт БД | `5432` |
| `DB_NAME` | Имя БД | `door_manufacturing` |
| `DB_USER` | Пользователь БД | `postgres` |
| `DB_PASSWORD` | Пароль БД | `postgres` |
| `REDIS_HOST` | Хост Redis | `redis` |
| `REDIS_PORT` | Порт Redis | `6379` |
| `JWT_SECRET` | Секрет JWT | - |
| `JWT_EXPIRES_IN` | Время жизни JWT | `24h` |

### Настройка email уведомлений

Для настройки email уведомлений необходимо указать SMTP параметры:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Настройка SMS уведомлений

```env
SMS_API_KEY=your_sms_api_key
SMS_API_URL=https://api.sms-provider.com/send
SMS_SENDER=YourSender
```

### Настройка Telegram бота

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add some amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы, пожалуйста:

1. Проверьте [документацию](docs/)
2. Поищите в [issues](../../issues)
3. Создайте новый [issue](../../issues/new)

## 🔄 Обновления

Для обновления до последней версии:

```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Мониторинг

### Health checks

- Backend: `GET /api/health`
- Database: Автоматическая проверка подключения
- Redis: Автоматическая проверка подключения

### Логи

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 🔒 Безопасность

- Все пароли хранятся в зашифрованном виде с использованием bcrypt
- JWT токены имеют ограниченное время жизни
- RBAC система контроля доступа
- Валидация всех входных данных
- Защита от CSRF атак
- Rate limiting для API

## 📱 Мобильная поддержка

Приложение адаптировано для мобильных устройств и планшетов. Поддерживаются:

- iOS Safari 12+
- Chrome Mobile 80+
- Samsung Internet 12+

## 🌐 Браузеры

Поддерживаемые браузеры:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+