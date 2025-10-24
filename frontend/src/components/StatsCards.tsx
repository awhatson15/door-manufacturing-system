import React from 'react';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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
  // В реальном приложении эти данные будут приходить с API
  const stats = [
    {
      title: 'Все заявки',
      value: 156,
      change: 12,
      changeType: 'increase' as const,
      icon: ClipboardDocumentListIcon,
      color: 'blue' as const,
    },
    {
      title: 'В работе',
      value: 23,
      change: -5,
      changeType: 'decrease' as const,
      icon: ClockIcon,
      color: 'yellow' as const,
    },
    {
      title: 'Завершено сегодня',
      value: 8,
      change: 15,
      changeType: 'increase' as const,
      icon: CheckCircleIcon,
      color: 'green' as const,
    },
    {
      title: 'Просрочено',
      value: 3,
      change: -2,
      changeType: 'decrease' as const,
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
