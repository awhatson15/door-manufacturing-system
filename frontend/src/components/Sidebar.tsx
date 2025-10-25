import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const router = useRouter();

  const menuItems = [
    {
      name: 'Главная',
      icon: HomeIcon,
      href: '/',
      active: router.pathname === '/',
    },
    {
      name: 'Заявки',
      icon: ClipboardDocumentListIcon,
      href: '/orders',
      active: router.pathname.startsWith('/orders'),
    },
    {
      name: 'Заказчики',
      icon: UserGroupIcon,
      href: '/customers',
      active: router.pathname.startsWith('/customers'),
    },
    {
      name: 'Файлы',
      icon: DocumentTextIcon,
      href: '/files',
      active: router.pathname === '/files',
    },
    {
      name: 'Настройки',
      icon: CogIcon,
      href: '/settings',
      active: router.pathname === '/settings',
    },
  ];

  const handleLogout = () => {
    // Здесь будет логика выхода
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className={`w-64 bg-gray-900 text-white h-screen ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Дверной Завод</h1>
        <p className="text-sm text-gray-400">Система учёта заявок</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  transition-colors duration-200
                  ${item.active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon
                  className="mr-3 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon
            className="mr-3 h-5 w-5"
            aria-hidden="true"
          />
          Выйти
        </button>
      </div>
    </div>
  );
};
