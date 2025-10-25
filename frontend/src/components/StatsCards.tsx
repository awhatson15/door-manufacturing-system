import React, { useEffect, useState } from 'react';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ordersApi, OrderStatistics } from '@/api/orders';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-600',
          iconBg: 'bg-green-100',
          iconText: 'text-green-600',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          iconText: 'text-yellow-600',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          iconBg: 'bg-red-100',
          iconText: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          iconBg: 'bg-gray-100',
          iconText: 'text-gray-600',
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`${colors.bg} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.text} mt-2`}>{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {changeType === 'increase' ? '+' : '-'}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-2">за неделю</span>
            </div>
          )}
        </div>
        <div className={`${colors.iconBg} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${colors.iconText}`} />
        </div>
      </div>
    </div>
  );
};

export const StatsCards: React.FC = () => {
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ordersApi.getStatistics();
        setStatistics(data);
      } catch (err: any) {
        console.error('Error fetching statistics:', err);
        setError(err.message || 'Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error || 'Не удалось загрузить статистику'}
      </div>
    );
  }

  const stats = [
    {
      title: 'Все заявки',
      value: statistics.total || 0,
      icon: ClipboardDocumentListIcon,
      color: 'blue' as const,
    },
    {
      title: 'В работе',
      value: statistics.byStatus?.IN_PROGRESS || 0,
      icon: ClockIcon,
      color: 'yellow' as const,
    },
    {
      title: 'Завершено',
      value: statistics.byStatus?.COMPLETED || 0,
      icon: CheckCircleIcon,
      color: 'green' as const,
    },
    {
      title: 'Просрочено',
      value: statistics.overdueCount || 0,
      icon: ExclamationTriangleIcon,
      color: 'red' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
