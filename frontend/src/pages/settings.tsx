import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usersApi, ChangePasswordRequest } from '@/api/users';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const SettingsPage: NextPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setChangingPassword(true);
      const data: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };
      await usersApi.changePassword(data);
      toast.success('Пароль успешно изменен');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Ошибка при изменении пароля');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      // Здесь будет API вызов для сохранения настроек уведомлений
      // Пока что просто симулируем задержку
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Настройки уведомлений сохранены');
    } catch (error) {
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setSavingNotifications(false);
    }
  };

  if (authLoading) {
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
        <title>Настройки - Система учёта заявок</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
            <p className="text-sm text-gray-600 mt-1">
              Управление профилем, темой и уведомлениями
            </p>
          </div>

          {/* User Profile Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <UserCircleIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Профиль пользователя</h2>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Смена пароля</h2>
            </div>
            <form onSubmit={handleChangePassword} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Введите текущий пароль"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Введите новый пароль (минимум 6 символов)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Повторите новый пароль"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {changingPassword && <LoadingSpinner size="sm" className="mr-2" />}
                    Изменить пароль
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Appearance Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <MoonIcon className="w-6 h-6 text-gray-600 mr-2" />
                ) : (
                  <SunIcon className="w-6 h-6 text-gray-600 mr-2" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">Оформление</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Тема оформления</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Выберите светлую или темную тему интерфейса
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                  aria-label="Toggle theme"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div
                  className={`
                    flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  onClick={() => theme !== 'light' && toggleTheme()}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SunIcon className="w-5 h-5 text-gray-700 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Светлая</span>
                    </div>
                    {theme === 'light' && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
                <div
                  className={`
                    flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MoonIcon className="w-5 h-5 text-gray-700 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Темная</span>
                    </div>
                    {theme === 'dark' && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <BellIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Настройки уведомлений</h2>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email уведомления</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Получать уведомления по электронной почте
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                  aria-label="Toggle email notifications"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS уведомления</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Получать уведомления через SMS
                  </p>
                </div>
                <button
                  onClick={() => setSmsNotifications(!smsNotifications)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${smsNotifications ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                  aria-label="Toggle SMS notifications"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${smsNotifications ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Telegram уведомления</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Получать уведомления в Telegram
                  </p>
                </div>
                <button
                  onClick={() => setTelegramNotifications(!telegramNotifications)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${telegramNotifications ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                  aria-label="Toggle Telegram notifications"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${telegramNotifications ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {savingNotifications && <LoadingSpinner size="sm" className="mr-2" />}
                  Сохранить настройки
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SettingsPage;
