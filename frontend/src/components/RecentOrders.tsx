import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ordersApi, Order } from '@/api/orders';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    case 'IN_PROGRESS':
      return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    case 'CANCELLED':
      return <XCircleIcon className="w-4 h-4 text-red-500" />;
    default:
      return <ClockIcon className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'Завершено';
    case 'IN_PROGRESS':
      return 'В работе';
    case 'CANCELLED':
      return 'Отменено';
    case 'PAUSED':
      return 'Приостановлена';
    case 'NEW':
      return 'Новая';
    default:
      return 'Новая';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600 bg-green-100';
    case 'IN_PROGRESS':
      return 'text-yellow-600 bg-yellow-100';
    case 'CANCELLED':
      return 'text-red-600 bg-red-100';
    case 'PAUSED':
      return 'text-gray-600 bg-gray-100';
    case 'NEW':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-blue-600 bg-blue-100';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'text-red-600 bg-red-100';
    case 'URGENT':
      return 'text-purple-600 bg-purple-100';
    case 'MEDIUM':
      return 'text-orange-600 bg-orange-100';
    case 'LOW':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'Высокий';
    case 'URGENT':
      return 'Срочный';
    case 'MEDIUM':
      return 'Средний';
    case 'LOW':
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
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.findAll({
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        });
        setOrders(response.data);
      } catch (err: any) {
        console.error('Error fetching recent orders:', err);
        setError(err.message || 'Ошибка загрузки заявок');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm">Нет заявок</p>
        </div>
      ) : (
        orders.map((order) => (
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
                  {order.customer?.name || 'Без заказчика'}
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

            {order.estimatedCompletionDate && (
              <div className="mt-2 text-xs text-gray-500">
                Срок: {new Date(order.estimatedCompletionDate).toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        ))
      )}

      {orders.length > 0 && (
        <div className="pt-3 text-center">
          <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Все заявки →
          </Link>
        </div>
      )}
    </div>
  );
};
