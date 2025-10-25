import { configureStore, createSlice } from '@reduxjs/toolkit';

// Создаем простой редьюсер для демонстрации
const initialState = {
  user: null,
  isAuthenticated: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

// Определяем тип для корневого состояния
export interface RootState {
  app: ReturnType<typeof appSlice.reducer>;
}

// Тип для dispatch
export type AppDispatch = typeof store.dispatch;

// Создаем store с базовой конфигурацией
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
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

// Экспортируем действия
export const { setUser, clearUser } = appSlice.actions;
