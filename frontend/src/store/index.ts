import { configureStore } from '@reduxjs/toolkit';

// Определяем тип для корневого состояния
export interface RootState {
  // Здесь будут наши редьюсеры
}

// Тип для dispatch
export type AppDispatch = typeof store.dispatch;

// Создаем store с базовой конфигурацией
export const store = configureStore({
  reducer: {
    // Здесь будут добавлены редьюсеры
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем эти action types для проверки сериализуемости
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Хуки для TypeScript
export const useAppDispatch = () => store.dispatch;
export const useAppSelector = <T>(selector: (state: RootState) => T) => {
  // В реальном приложении здесь будет использоваться useSelector из react-redux
  // Но для простоты пока вернем mock
  return selector({} as RootState);
};
