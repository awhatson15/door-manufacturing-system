import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { KanbanBoard } from '@/components/KanbanBoard';
import { StatsCards } from '@/components/StatsCards';
import { RecentOrders } from '@/components/RecentOrders';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Планировщик заявок | Система учёта заявок</title>
        <meta name="description" content="Система учёта заявок для производства металлических дверей" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Заголовок страницы */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text">
                Добро пожаловать, {user?.firstName}!
              </h1>
              <p className="text-text-secondary mt-1">
                Управление заявками на производство металлических дверей
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Новая заявка
              </button>
              <button className="btn btn-secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Экспорт
              </button>
            </div>
          </div>

          {/* Статистические карточки */}
          <StatsCards />

          {/* Основной контент */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Канбан-доска */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-text">Канбан-доска</h2>
                  <div className="flex items-center space-x-2">
                    <button className="btn btn-ghost btn-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <KanbanBoard />
                </div>
              </div>
            </div>

            {/* Последние заявки */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-text">Последние заявки</h2>
                  <button className="btn btn-ghost btn-sm">
                    Все заявки
                  </button>
                </div>
                <div className="card-body">
                  <RecentOrders />
                </div>
              </div>

              {/* Быстрые действия */}
              <div className="card mt-6">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-text">Быстрые действия</h2>
                </div>
                <div className="card-body space-y-3">
                  <button className="w-full btn btn-secondary justify-start">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Поиск заявок
                  </button>
                  <button className="w-full btn btn-secondary justify-start">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Управление заказчиками
                  </button>
                  <button className="w-full btn btn-secondary justify-start">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Настройки системы
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
