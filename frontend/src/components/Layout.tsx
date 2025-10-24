import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from './common/LoadingSpinner';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  // Применяем тему к корневому элементу
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Показываем загрузку при проверке аутентификации
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Если пользователь не аутентифицирован, показываем страницу входа
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Основной layout для аутентифицированных пользователей
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Боковая панель */}
        <Sidebar />

        {/* Основной контент */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Верхняя панель */}
          <Header user={user} />

          {/* Контент страницы */}
          <main className="flex-1 container-custom py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
