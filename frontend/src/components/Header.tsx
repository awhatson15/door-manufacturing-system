import React from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HeaderProps {
  user: User | null;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ user, className = '' }) => {
  const handleNotificationClick = () => {
    // Здесь будет логика показа уведомлений
    console.log('Notifications clicked');
  };

  const handleProfileClick = () => {
    // Здесь будет логика показа профиля
    console.log('Profile clicked');
  };

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть -breadcrumb или заголовок страницы */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Система учёта заявок
            </h1>
          </div>

          {/* Правая часть - действия пользователя */}
          <div className="flex items-center space-x-4">
            {/* Уведомления */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg transition-colors"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {/* Индикатор новых уведомлений */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* Профиль пользователя */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Гость'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role || 'Не авторизован'}
                  </p>
                </div>
                <UserCircleIcon
                  className="h-8 w-8 text-gray-400"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Вторая строка - дополнительная информация или фильтры */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Сегодня</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('ru-RU')}</span>
          </div>

          {/* Статистика или быстрые действия */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-xs text-gray-500">Активных заявок</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-xs text-gray-500">В работе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-xs text-gray-500">Завершено сегодня</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
