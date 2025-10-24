import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { KanbanBoard } from '@/components/KanbanBoard';
import { StatsCards } from '@/components/StatsCards';
import { RecentOrders } from '@/components/RecentOrders';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const HomePage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Главная - Система учёта заявок</title>
        <meta name="description" content="Система учёта заявок для производства металлических дверей" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Приветствие */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Добро пожаловать, {user?.name || 'Пользователь'}!
            </h1>
            <p className="text-gray-600">
              Система учёта заявок для производства металлических дверей
            </p>
          </div>

          {/* Статистика */}
          <StatsCards />

          {/* Канбан доска */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Канбан-доска заявок
              </h2>
            </div>
            <KanbanBoard />
          </div>

          {/* Последние заявки */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Недавние заявки
              </h2>
            </div>
            <RecentOrders />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
