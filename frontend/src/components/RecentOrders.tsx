import React from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  customer: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    customer: 'ООО "СтройМастер"',
    title: 'Металлическая дверь 2000x2100',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-10-28',
    createdAt: '2024-10-24T10:30:00Z'
  },
  {
    id: '2',
    customer: 'ИП Петров',
    title: 'Входная группа',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-10-30',
    createdAt: '2024-10-24T09:15:00Z'
  },
  {
    id: '3',
    customer: 'ООО "Альфа"',
    title: 'Пожарные двери',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-10-26',
    createdAt: '2024-10-24T08:45:00Z'
  },
  {
    id: '4',
    customer: 'ООО "ТехСтрой"',
    title: 'Двери для склада',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-10-25',
    createdAt: '2024-10-24T07:20:00Z'
  },
  {
    id: '5',
    customer: 'ИП Смирнов',
    title: 'Тамбурные двери',
    status: 'cancelled',
    priority: 'low',
    dueDate: '2024-10-24',
    createdAt: '2024-10-24T06:10:00Z'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    case 'in_progress':
      return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    case 'cancelled':
      return <XCircleIcon className="w-4 h-4 text-red-500" />;
    default:
      return <ClockIcon className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'in_progress':
      return 'В работе';
    case 'cancelled':
      return 'Отменено';
    case 'pending':
      return 'Ожидание';
    default:
      return 'Ожидание';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'in_progress':
      return 'text-yellow-600 bg-yellow-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-orange-600 bg-orange-100';
    case 'low':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
      return 'Низкий';
    default:
      return 'Низкий';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Вчера';
  } else if (diffDays < 7) {
    return `${diffDays} дня назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};

export const RecentOrders: React.FC = () => {
  const handleOrderClick = (orderId: string) => {
    console.log('Открытие заявки:', orderId);
    // Здесь будет логика перехода на детальную страницу заявки
  };

  return (
    <div className="space-y-3">
      {mockOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm">Нет заявок</p>
        </div>
      ) : (
        mockOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => handleOrderClick(order.id)}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {order.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {order.customer}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                  {getPriorityLabel(order.priority)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusLabel(order.status)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {formatDate(order.createdAt)}
              </div>
            </div>

            {order.dueDate && (
              <div className="mt-2 text-xs text-gray-500">
                Срок: {new Date(order.dueDate).toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        ))
      )}

      {mockOrders.length > 0 && (
        <div className="pt-3 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Все заявки →
          </button>
        </div>
      )}
    </div>
  );
};
