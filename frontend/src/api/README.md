# Frontend API Layer

Данный слой предоставляет удобный интерфейс для взаимодействия с backend API системы управления производством дверей.

## Структура

- `client.ts` - Базовый HTTP клиент на основе axios с настройками и интерцепторами
- `auth.ts` - API для аутентификации и управления пользователями
- `orders.ts` - API для работы с заявками
- `customers.ts` - API для работы с клиентами
- `users.ts` - API для управления пользователями
- `stages.ts` - API для работы с этапами производства
- `files.ts` - API для работы с файлами
- `comments.ts` - API для работы с комментариями
- `notifications.ts` - API для работы с уведомлениями
- `index.ts` - Централизованный экспорт всех модулей

## Использование

### Базовый импорт

```typescript
import { authApi, ordersApi, customersApi } from '../api';
```

### Аутентификация

```typescript
// Вход в систему
try {
  await authApi.login('user@example.com', 'password');
  // Пользователь авторизован, токены сохранены
} catch (error) {
  console.error('Ошибка входа:', error.message);
}

// Выход из системы
await authApi.logout();
```

### Работа с заявками

```typescript
// Получение списка заявок
const orders = await ordersApi.findAll({
  page: 1,
  limit: 10,
  status: 'IN_PROGRESS'
});

// Создание новой заявки
const newOrder = await ordersApi.create({
  orderNumber: 'ORD-001',
  title: 'Новый заказ',
  customerId: 'customer-id',
  managerId: 'manager-id',
  priority: 'HIGH'
});

// Обновление заявки
const updatedOrder = await ordersApi.update(orderId, {
  status: 'COMPLETED'
});
```

### Работа с файлами

```typescript
// Загрузка файла
const file = await filesApi.upload(selectedFile, {
  orderId: 'order-id',
  type: 'DOCUMENT',
  visibility: 'INTERNAL',
  description: 'Чертеж двери'
});

// Скачивание файла
await filesApi.download(fileId, 'door-drawing.pdf');
```

## Настройка

Для настройки API URL создайте файл `.env.local` в корне frontend проекта:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Обработка ошибок

Все API функции выбрасывают ошибки с унифицированной структурой:

```typescript
interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

Пример обработки ошибок:

```typescript
try {
  const order = await ordersApi.findOne(orderId);
} catch (error) {
  if (error.status === 404) {
    console.log('Заявка не найдена');
  } else if (error.status === 403) {
    console.log('Нет доступа к заявке');
  } else {
    console.error('Ошибка:', error.message);
  }
}
```

## Автоматическое обновление токена

Система автоматически обрабатывает истечение access токена:

1. При получении 401 ошибки пытается обновить токен через refresh token
2. При успешном обновлении повторяет исходный запрос
3. При неудаче очищает токены и перенаправляет на страницу входа

## Типизация

Все API функции полностью типизированы с использованием TypeScript:

```typescript
// Типы данных автоматически подставляются
const order: Order = await ordersApi.findOne(orderId);
const customers: PaginatedResponse<Customer> = await customersApi.findAll();
```

## Логирование

В режиме разработки все запросы и ответы логируются в консоль:

```
🚀 API Request: GET /orders?page=1&limit=10
✅ API Response: GET /orders?page=1&limit=10 { status: 200, data: [...] }
❌ API Error: POST /auth/login { status: 401, message: 'Неверные учетные данные' }