import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
// import { Layout } from '@/components/Layout';
// import { KanbanBoard } from '@/components/KanbanBoard';
// import { StatsCards } from '@/components/StatsCards';
// import { RecentOrders } from '@/components/RecentOrders';
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
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Добро пожаловать!</h1>
          <p className='text-gray-600 mb-6'>Система учёта заявок загружается...</p>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
