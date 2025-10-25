import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ordersApi, Order, OrderStage } from '@/api/orders';
import {
  ArrowLeftIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

const OrderDetailPage: NextPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [stages, setStages] = useState<OrderStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [pauseReason, setPauseReason] = useState('');
  const [skipStageId, setSkipStageId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrderData = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      setError(null);
      const [orderData, stagesData] = await Promise.all([
        ordersApi.findOne(id),
        ordersApi.getOrderStages(id),
      ]);
      setOrder(orderData);
      setStages(stagesData);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных заявки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderData();
    }
  }, [isAuthenticated, id]);

  const getStatusBadge = (status: string) => {
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const getStageStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      SKIPPED: 'bg-orange-100 text-orange-700',
    };
    const labels = {
      PENDING: 'Ожидает',
      IN_PROGRESS: 'В работе',
      COMPLETED: 'Завершён',
      SKIPPED: 'Пропущен',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleCancelOrder = async () => {
    if (!id || typeof id !== 'string' || !cancelReason.trim()) return;

    try {
      setActionLoading(true);
      await ordersApi.cancel(id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при отмене заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseOrder = async () => {
    if (!id || typeof id !== 'string' || !pauseReason.trim()) return;

    try {
      setActionLoading(true);
      await ordersApi.pause(id, pauseReason);
      setShowPauseModal(false);
      setPauseReason('');
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при приостановке заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeOrder = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setActionLoading(true);
      await ordersApi.resume(id);
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при возобновлении заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!id || typeof id !== 'string') return;

    if (!confirm('Вы уверены, что хотите завершить эту заявку?')) return;

    try {
      setActionLoading(true);
      await ordersApi.complete(id);
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при завершении заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartStage = async (stageId: string) => {
    if (!id || typeof id !== 'string') return;

    try {
      setActionLoading(true);
      await ordersApi.startOrderStage(id, stageId);
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при запуске этапа');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteStage = async (stageId: string) => {
    if (!id || typeof id !== 'string') return;

    try {
      setActionLoading(true);
      await ordersApi.completeOrderStage(id, stageId);
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при завершении этапа');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipStage = async () => {
    if (!id || typeof id !== 'string' || !skipStageId || !skipReason.trim()) return;

    try {
      setActionLoading(true);
      await ordersApi.skipOrderStage(id, skipStageId, skipReason);
      setShowSkipModal(false);
      setSkipStageId(null);
      setSkipReason('');
      await fetchOrderData();
    } catch (err: any) {
      alert(err.message || 'Ошибка при пропуске этапа');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (error || !order) {
    return (
      <Layout>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <p className='text-red-600 mb-4'>{error || 'Заявка не найдена'}</p>
            <Link
              href='/orders'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <ArrowLeftIcon className='w-5 h-5 mr-2' />
              Вернуться к списку заявок
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const canEditOrder = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
  const canCancelOrder = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
  const canPauseOrder = order.status === 'IN_PROGRESS';
  const canResumeOrder = order.status === 'PAUSED';
  const canCompleteOrder = order.status === 'IN_PROGRESS';

  return (
    <>
      <Head>
        <title>{order.orderNumber} - {order.title} - Система учёта заявок</title>
      </Head>

      <Layout>
        <div className='space-y-6'>
          {/* Back Button and Actions */}
          <div className='flex justify-between items-start'>
            <Link
              href='/orders'
              className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeftIcon className='w-5 h-5 mr-2' />
              Назад к списку заявок
            </Link>

            <div className='flex gap-2'>
              {canEditOrder && (
                <button
                  onClick={() => router.push(`/orders/${id}/edit`)}
                  className='inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                >
                  <PencilIcon className='w-5 h-5 mr-2' />
                  Редактировать
                </button>
              )}

              {canPauseOrder && (
                <button
                  onClick={() => setShowPauseModal(true)}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50'
                >
                  <PauseCircleIcon className='w-5 h-5 mr-2' />
                  Приостановить
                </button>
              )}

              {canResumeOrder && (
                <button
                  onClick={handleResumeOrder}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                >
                  <PlayCircleIcon className='w-5 h-5 mr-2' />
                  Возобновить
                </button>
              )}

              {canCompleteOrder && (
                <button
                  onClick={handleCompleteOrder}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                >
                  <CheckCircleIcon className='w-5 h-5 mr-2' />
                  Завершить
                </button>
              )}

              {canCancelOrder && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                  className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                >
                  <XCircleIcon className='w-5 h-5 mr-2' />
                  Отменить
                </button>
              )}
            </div>
          </div>

          {/* Order Header */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  {order.orderNumber}
                </h1>
                <h2 className='text-xl text-gray-700'>{order.title}</h2>
              </div>
              <div className='flex gap-2'>
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Информация о заявке</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Customer Info */}
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Заказчик</h4>
                {order.customer ? (
                  <div className='space-y-2'>
                    <Link
                      href={`/customers/${order.customer.id}`}
                      className='flex items-center text-blue-600 hover:text-blue-800 transition-colors'
                    >
                      <UserIcon className='w-5 h-5 mr-2' />
                      <span className='font-medium'>{order.customer.name}</span>
                    </Link>
                    {order.customer.email && (
                      <div className='flex items-center text-gray-600 text-sm'>
                        <EnvelopeIcon className='w-4 h-4 mr-2' />
                        <a href={`mailto:${order.customer.email}`} className='hover:text-gray-900'>
                          {order.customer.email}
                        </a>
                      </div>
                    )}
                    {order.customer.phone && (
                      <div className='flex items-center text-gray-600 text-sm'>
                        <PhoneIcon className='w-4 h-4 mr-2' />
                        <a href={`tel:${order.customer.phone}`} className='hover:text-gray-900'>
                          {order.customer.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-500 text-sm'>Не указан</p>
                )}
              </div>

              {/* Manager Info */}
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Менеджер</h4>
                {order.manager ? (
                  <div className='space-y-2'>
                    <div className='flex items-center text-gray-900'>
                      <UserIcon className='w-5 h-5 mr-2' />
                      <span className='font-medium'>{order.manager.name}</span>
                    </div>
                    {order.manager.email && (
                      <div className='flex items-center text-gray-600 text-sm'>
                        <EnvelopeIcon className='w-4 h-4 mr-2' />
                        <a href={`mailto:${order.manager.email}`} className='hover:text-gray-900'>
                          {order.manager.email}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-500 text-sm'>Не указан</p>
                )}
              </div>

              {/* Dates */}
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Даты</h4>
                <div className='space-y-2'>
                  <div className='flex items-center text-sm'>
                    <CalendarIcon className='w-4 h-4 mr-2 text-gray-500' />
                    <span className='text-gray-600'>Создана:</span>
                    <span className='ml-2 text-gray-900'>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.estimatedCompletionDate && (
                    <div className='flex items-center text-sm'>
                      <ClockIcon className='w-4 h-4 mr-2 text-gray-500' />
                      <span className='text-gray-600'>Планируется:</span>
                      <span className='ml-2 text-gray-900'>{formatDate(order.estimatedCompletionDate)}</span>
                    </div>
                  )}
                  {order.actualCompletionDate && (
                    <div className='flex items-center text-sm'>
                      <CheckCircleIcon className='w-4 h-4 mr-2 text-green-500' />
                      <span className='text-gray-600'>Завершена:</span>
                      <span className='ml-2 text-gray-900'>{formatDate(order.actualCompletionDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              {order.totalAmount && (
                <div className='space-y-3'>
                  <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Сумма</h4>
                  <div className='flex items-center text-lg font-semibold text-gray-900'>
                    <CurrencyDollarIcon className='w-5 h-5 mr-2 text-gray-500' />
                    {order.totalAmount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              )}
            </div>

            {/* Description and Notes */}
            {(order.description || order.notes) && (
              <div className='mt-6 pt-6 border-t border-gray-200 space-y-4'>
                {order.description && (
                  <div>
                    <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2'>Описание</h4>
                    <p className='text-gray-700 whitespace-pre-wrap'>{order.description}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2'>Примечания</h4>
                    <p className='text-gray-700 whitespace-pre-wrap'>{order.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Stages */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Этапы производства</h3>

            {stages.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>Этапы не назначены</p>
            ) : (
              <div className='space-y-3'>
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className='border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-start gap-3'>
                        <div className='flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm'>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className='text-base font-semibold text-gray-900'>
                            {stage.stage?.name || 'Без названия'}
                          </h4>
                          {stage.stage?.description && (
                            <p className='text-sm text-gray-600 mt-1'>{stage.stage.description}</p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getStageStatusBadge(stage.status)}
                      </div>
                    </div>

                    {/* Stage Details */}
                    <div className='ml-11 space-y-2'>
                      {stage.assignedTo && (
                        <div className='flex items-center text-sm text-gray-600'>
                          <UserIcon className='w-4 h-4 mr-2' />
                          <span>Исполнитель: {stage.assignedTo.name}</span>
                        </div>
                      )}

                      {stage.startedAt && (
                        <div className='flex items-center text-sm text-gray-600'>
                          <ClockIcon className='w-4 h-4 mr-2' />
                          <span>Начат: {formatDateTime(stage.startedAt)}</span>
                        </div>
                      )}

                      {stage.completedAt && (
                        <div className='flex items-center text-sm text-gray-600'>
                          <CheckCircleIcon className='w-4 h-4 mr-2' />
                          <span>Завершён: {formatDateTime(stage.completedAt)}</span>
                        </div>
                      )}

                      {stage.notes && (
                        <div className='flex items-start text-sm text-gray-600'>
                          <DocumentTextIcon className='w-4 h-4 mr-2 mt-0.5' />
                          <span>{stage.notes}</span>
                        </div>
                      )}

                      {/* Stage Actions */}
                      {canEditOrder && (
                        <div className='flex gap-2 mt-3'>
                          {stage.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartStage(stage.id)}
                              disabled={actionLoading}
                              className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50'
                            >
                              Начать
                            </button>
                          )}

                          {stage.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleCompleteStage(stage.id)}
                                disabled={actionLoading}
                                className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50'
                              >
                                Завершить
                              </button>
                              <button
                                onClick={() => {
                                  setSkipStageId(stage.id);
                                  setShowSkipModal(true);
                                }}
                                disabled={actionLoading}
                                className='px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors disabled:opacity-50'
                              >
                                Пропустить
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Progress */}
            {stages.length > 0 && (
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='flex items-center justify-between text-sm mb-2'>
                  <span className='text-gray-600'>Прогресс выполнения</span>
                  <span className='font-semibold text-gray-900'>
                    {stages.filter(s => s.status === 'COMPLETED').length} / {stages.length}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all'
                    style={{
                      width: `${(stages.filter(s => s.status === 'COMPLETED').length / stages.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Comments Section - Placeholder */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                <ChatBubbleLeftRightIcon className='w-6 h-6 mr-2' />
                Комментарии
              </h3>
            </div>
            <p className='text-gray-500 text-center py-8'>
              Функционал комментариев будет добавлен позже
            </p>
          </div>

          {/* Files Section - Placeholder */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                <PaperClipIcon className='w-6 h-6 mr-2' />
                Файлы
              </h3>
            </div>
            <p className='text-gray-500 text-center py-8'>
              Функционал файлов будет добавлен позже
            </p>
          </div>
        </div>
      </Layout>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Отмена заявки</h3>
            <p className='text-gray-600 mb-4'>Укажите причину отмены заявки:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4'
              rows={4}
              placeholder='Причина отмены...'
            />
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Отменить
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading || !cancelReason.trim()}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
              >
                {actionLoading ? 'Отмена...' : 'Отменить заявку'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {showPauseModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Приостановка заявки</h3>
            <p className='text-gray-600 mb-4'>Укажите причину приостановки заявки:</p>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-4'
              rows={4}
              placeholder='Причина приостановки...'
            />
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setPauseReason('');
                }}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Отменить
              </button>
              <button
                onClick={handlePauseOrder}
                disabled={actionLoading || !pauseReason.trim()}
                className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50'
              >
                {actionLoading ? 'Приостановка...' : 'Приостановить заявку'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Stage Modal */}
      {showSkipModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Пропуск этапа</h3>
            <p className='text-gray-600 mb-4'>Укажите причину пропуска этапа:</p>
            <textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4'
              rows={4}
              placeholder='Причина пропуска...'
            />
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => {
                  setShowSkipModal(false);
                  setSkipStageId(null);
                  setSkipReason('');
                }}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Отменить
              </button>
              <button
                onClick={handleSkipStage}
                disabled={actionLoading || !skipReason.trim()}
                className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50'
              >
                {actionLoading ? 'Пропуск...' : 'Пропустить этап'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailPage;
