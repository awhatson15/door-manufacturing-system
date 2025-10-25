import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { customersApi, Customer } from '@/api/customers';
import { ordersApi, Order } from '@/api/orders';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  NoSymbolIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const CustomerDetailPage: NextPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchCustomerData = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      setError(null);
      const customerData = await customersApi.findOne(id);
      setCustomer(customerData);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных клиента');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setOrdersLoading(true);
      const response = await ordersApi.findAll({
        customerId: id,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setOrders(response.data);
    } catch (err: any) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchCustomerData();
      fetchCustomerOrders();
    }
  }, [isAuthenticated, id]);

  const handleActivate = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setActionLoading(true);
      await customersApi.activate(id);
      await fetchCustomerData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при активации клиента');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id || typeof id !== 'string') return;

    if (!confirm('Вы уверены, что хотите деактивировать этого клиента?')) return;

    try {
      setActionLoading(true);
      await customersApi.deactivate(id);
      await fetchCustomerData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при деактивации клиента');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlacklist = async () => {
    if (!id || typeof id !== 'string') return;

    if (!confirm('Вы уверены, что хотите добавить этого клиента в черный список? Это действие можно отменить только через активацию.')) return;

    try {
      setActionLoading(true);
      await customersApi.blacklist(id);
      await fetchCustomerData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при добавлении клиента в черный список');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLACKLISTED: 'bg-red-100 text-red-800',
    };
    const labels = {
      ACTIVE: 'Активный',
      INACTIVE: 'Неактивный',
      BLACKLISTED: 'Заблокирован',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const styles = {
      NEW: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      PAUSED: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const labels = {
      NEW: 'Новая',
      IN_PROGRESS: 'В работе',
      PAUSED: 'Приостановлена',
      COMPLETED: 'Завершена',
      CANCELLED: 'Отменена',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-orange-100 text-orange-800',
      HIGH: 'bg-red-100 text-red-800',
      URGENT: 'bg-purple-100 text-purple-800',
    };
    const labels = {
      LOW: 'Низкий',
      MEDIUM: 'Средний',
      HIGH: 'Высокий',
      URGENT: 'Срочный',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (loading) {
    return (
      <Layout>
        <div className='flex justify-center items-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <p className='text-red-600 mb-4'>{error || 'Клиент не найден'}</p>
            <Link
              href='/customers'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <ArrowLeftIcon className='w-5 h-5 mr-2' />
              Вернуться к списку клиентов
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const canEdit = customer.status !== 'BLACKLISTED';
  const canActivate = customer.status === 'INACTIVE' || customer.status === 'BLACKLISTED';
  const canDeactivate = customer.status === 'ACTIVE';
  const canBlacklist = customer.status !== 'BLACKLISTED';

  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <>
      <Head>
        <title>{customer.name} - Система учёта заявок</title>
      </Head>

      <Layout>
        <div className='space-y-6'>
          {/* Back Button and Actions */}
          <div className='flex justify-between items-start'>
            <Link
              href='/customers'
              className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeftIcon className='w-5 h-5 mr-2' />
              Назад к списку клиентов
            </Link>

            <div className='flex gap-2'>
              {canEdit && (
                <button
                  onClick={() => router.push(`/customers/${id}/edit`)}
                  className='inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                >
                  <PencilIcon className='w-5 h-5 mr-2' />
                  Редактировать
                </button>
              )}

              {canActivate && (
                <button
                  onClick={handleActivate}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                >
                  <CheckCircleIcon className='w-5 h-5 mr-2' />
                  Активировать
                </button>
              )}

              {canDeactivate && (
                <button
                  onClick={handleDeactivate}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50'
                >
                  <XCircleIcon className='w-5 h-5 mr-2' />
                  Деактивировать
                </button>
              )}

              {canBlacklist && (
                <button
                  onClick={handleBlacklist}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                >
                  <NoSymbolIcon className='w-5 h-5 mr-2' />
                  В черный список
                </button>
              )}
            </div>
          </div>

          {/* Customer Header */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <UserIcon className='w-8 h-8 text-gray-400' />
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {customer.name}
                  </h1>
                </div>
                {customer.contactPerson && (
                  <p className='text-sm text-gray-600 ml-11'>
                    Контактное лицо: {customer.contactPerson}
                  </p>
                )}
              </div>
              {getStatusBadge(customer.status)}
            </div>
          </div>

          {/* Statistics Section */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Всего заявок</p>
                  <p className='text-3xl font-bold text-gray-900'>{orders.length}</p>
                </div>
                <ShoppingBagIcon className='w-10 h-10 text-blue-500' />
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Завершенных заявок</p>
                  <p className='text-3xl font-bold text-green-600'>{completedOrdersCount}</p>
                </div>
                <CheckCircleIcon className='w-10 h-10 text-green-500' />
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Общая сумма</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {totalAmount > 0 ? `${totalAmount.toLocaleString('ru-RU')} ₽` : '-'}
                  </p>
                </div>
                <ChartBarIcon className='w-10 h-10 text-purple-500' />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Информация о клиенте</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Contact Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                  Контактная информация
                </h4>

                <div className='space-y-3'>
                  <div className='flex items-start'>
                    <EnvelopeIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                    <div>
                      <p className='text-sm text-gray-600'>Email</p>
                      <a
                        href={`mailto:${customer.email}`}
                        className='text-blue-600 hover:text-blue-800 transition-colors'
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  {customer.phone && (
                    <div className='flex items-start'>
                      <PhoneIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-600'>Телефон</p>
                        <a
                          href={`tel:${customer.phone}`}
                          className='text-blue-600 hover:text-blue-800 transition-colors'
                        >
                          {customer.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {customer.address && (
                    <div className='flex items-start'>
                      <MapPinIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-600'>Адрес</p>
                        <p className='text-gray-900'>{customer.address}</p>
                      </div>
                    </div>
                  )}

                  {customer.contactPerson && (
                    <div className='flex items-start'>
                      <UserIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-600'>Контактное лицо</p>
                        <p className='text-gray-900'>{customer.contactPerson}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className='space-y-4'>
                <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                  Реквизиты компании
                </h4>

                <div className='space-y-3'>
                  {customer.inn && (
                    <div className='flex items-start'>
                      <BuildingOfficeIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-600'>ИНН</p>
                        <p className='text-gray-900 font-mono'>{customer.inn}</p>
                      </div>
                    </div>
                  )}

                  {customer.kpp && (
                    <div className='flex items-start'>
                      <BuildingOfficeIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-600'>КПП</p>
                        <p className='text-gray-900 font-mono'>{customer.kpp}</p>
                      </div>
                    </div>
                  )}

                  {customer.ogrn && (
                    <div className='flex items-start'>
                      <BuildingOfficeIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-600'>ОГРН</p>
                        <p className='text-gray-900 font-mono'>{customer.ogrn}</p>
                      </div>
                    </div>
                  )}

                  <div className='flex items-start'>
                    <CalendarIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                    <div>
                      <p className='text-sm text-gray-600'>Дата добавления</p>
                      <p className='text-gray-900'>{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {customer.notes && (
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='flex items-start'>
                  <DocumentTextIcon className='w-5 h-5 mr-3 text-gray-400 mt-0.5' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2'>
                      Примечания
                    </h4>
                    <p className='text-gray-700 whitespace-pre-wrap'>{customer.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Заявки клиента</h3>
              <Link
                href={`/orders/new?customerId=${id}`}
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
              >
                Создать заявку
              </Link>
            </div>

            {ordersLoading ? (
              <div className='flex justify-center items-center py-12'>
                <LoadingSpinner size='lg' />
              </div>
            ) : orders.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-500 mb-4'>У клиента пока нет заявок</p>
                <Link
                  href={`/orders/new?customerId=${id}`}
                  className='inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Создать первую заявку
                </Link>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Номер заявки
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Название
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Статус
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Приоритет
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Менеджер
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Создана
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className='hover:bg-gray-50 cursor-pointer transition-colors'
                      >
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {order.orderNumber}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {order.title}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {getOrderStatusBadge(order.status)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {getPriorityBadge(order.priority)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {order.manager?.name || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CustomerDetailPage;
