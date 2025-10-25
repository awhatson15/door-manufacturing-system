import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authApi, LoginRequest, UserProfile } from '../api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, roleId?: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authApi.getAccessToken();
        if (token) {
          // Проверяем валидность токена и получаем данные пользователя
          const userProfile = await authApi.getProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Ошибка при инициализации аутентификации:', error);
        // Если токен невалидный, очищаем его
        authApi.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    try {
      const loginData: LoginRequest = { email, password, rememberMe };
      const response = await authApi.login(loginData);
      
      // Сохраняем токены
      authApi.saveTokens(response.accessToken);
      
      // Устанавливаем данные пользователя
      setUser(response.user);
      
      // Перенаправляем на главную страницу
      router.push('/');
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Вызываем API для выхода
      await authApi.logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // В любом случае очищаем данные и перенаправляем
      setUser(null);
      authApi.clearTokens();
      router.push('/login');
    }
  };

  const register = async (email: string, password: string, name: string, roleId?: string) => {
    setIsLoading(true);
    try {
      const registerData = { email, password, name, roleId };
      const response = await authApi.register(registerData);
      
      // Сохраняем токены
      authApi.saveTokens(response.accessToken);
      
      // Устанавливаем данные пользователя
      setUser(response.user);
      
      // Перенаправляем на главную страницу
      router.push('/');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      return await authApi.autoRefreshToken();
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
