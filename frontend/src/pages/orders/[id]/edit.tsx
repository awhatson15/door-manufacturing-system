import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Validation schema
const updateOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  mainNumber: z.string().optional(),
  doorTypeId: z.string().uuid().optional().or(z.literal('')),
  heightMm: z.number().min(1).optional().or(z.nan()),
  widthMm: z.number().min(1).optional().or(z.nan()),
  colorId: z.string().uuid().optional().or(z.literal('')),
  lockId: z.string().uuid().optional().or(z.literal('')),
  thresholdId: z.string().uuid().optional().or(z.literal('')),
  shieldNumber: z.string().optional(),
  deliveryMethod: z.enum(['самовывоз', 'доставка', 'доставка+монтаж']).optional().or(z.literal('')),
  plannedCompletionDate: z.string().optional(),
  totalAmount: z.number().min(0).optional().or(z.nan()),
  managerComment: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'paused', 'cancelled', 'completed']).optional(),
  isCancelled: z.boolean().optional(),
  cancelReasonId: z.string().uuid().optional().or(z.literal('')),
  isPaused: z.boolean().optional(),
  pauseReason: z.string().optional(),
});

type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;

interface Reference {
  id: string;
  name?: string;
  code?: string;
  model?: string;
  type?: string;
}

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [doorTypes, setDoorTypes] = useState<Reference[]>([]);
  const [colors, setColors] = useState<Reference[]>([]);
  const [locks, setLocks] = useState<Reference[]>([]);
  const [thresholds, setThresholds] = useState<Reference[]>([]);
  const [cancelReasons, setCancelReasons] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateOrderFormData>({
    resolver: zodResolver(updateOrderSchema),
  });

  const isCancelled = watch('isCancelled');
  const isPaused = watch('isPaused');

  // Load order data
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setOrder(data);

        // Set form values
        reset({
          customerId: data.customer?.id,
          mainNumber: data.mainNumber || '',
          doorTypeId: data.doorType?.id || '',
          heightMm: data.heightMm || undefined,
          widthMm: data.widthMm || undefined,
          colorId: data.color?.id || '',
          lockId: data.lock?.id || '',
          thresholdId: data.threshold?.id || '',
          shieldNumber: data.shieldNumber || '',
          deliveryMethod: data.deliveryMethod || '',
          plannedCompletionDate: data.plannedCompletionDate
            ? new Date(data.plannedCompletionDate).toISOString().split('T')[0]
            : '',
          totalAmount: data.totalAmount || undefined,
          managerComment: data.managerComment || '',
          status: data.status,
          isCancelled: data.isCancelled,
          cancelReasonId: data.cancelReason?.id || '',
          isPaused: data.isPaused,
          pauseReason: data.pauseReason || '',
        });
      } catch (error) {
        console.error('Failed to load order:', error);
        toast.error('Не удалось загрузить заявку');
        router.push('/orders');
      }
    };
    fetchOrder();
  }, [id, reset, router]);

  // Load customers and references
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [
          customersRes,
          doorTypesRes,
          colorsRes,
          locksRes,
          thresholdsRes,
          cancelReasonsRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/api/customers`, { headers, params: { limit: 1000 } }),
          axios.get(`${API_URL}/api/references/door-types/active`, { headers }),
          axios.get(`${API_URL}/api/references/ral-colors/active`, { headers }),
          axios.get(`${API_URL}/api/references/locks/active`, { headers }),
          axios.get(`${API_URL}/api/references/thresholds/active`, { headers }),
          axios.get(`${API_URL}/api/references/cancel-reasons/active`, { headers }),
        ]);

        setCustomers(customersRes.data.data || []);
        setDoorTypes(doorTypesRes.data);
        setColors(colorsRes.data);
        setLocks(locksRes.data);
        setThresholds(thresholdsRes.data);
        setCancelReasons(cancelReasonsRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: UpdateOrderFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Prepare data
      const payload = {
        ...data,
        doorTypeId: data.doorTypeId || null,
        colorId: data.colorId || null,
        lockId: data.lockId || null,
        thresholdId: data.thresholdId || null,
        cancelReasonId: data.cancelReasonId || null,
        deliveryMethod: data.deliveryMethod || null,
        heightMm: data.heightMm || null,
        widthMm: data.widthMm || null,
        totalAmount: data.totalAmount || null,
      };

      await axios.patch(`${API_URL}/api/orders/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Заявка успешно обновлена');
      router.push(`/orders/${id}`);
    } catch (error: any) {
      console.error('Failed to update order:', error);
      const message = error.response?.data?.message || 'Не удалось обновить заявку';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <Layout>
        <Head>
          <title>Загрузка... | Door Manufacturing</title>
        </Head>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Редактирование заявки {order.displayName} | Door Manufacturing</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Редактирование заявки {order.displayName}
            </h1>
            <span className="text-sm text-gray-500">
              Внутренний номер: {order.internalNumber}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Заказчик
              </label>
              <select
                {...register('customerId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Main Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Основной номер
              </label>
              <input
                type="text"
                {...register('mainNumber')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Door Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Тип двери
              </label>
              <select
                {...register('doorTypeId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Не выбрано</option>
                {doorTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Высота (мм)
                </label>
                <input
                  type="number"
                  {...register('heightMm', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ширина (мм)
                </label>
                <input
                  type="number"
                  {...register('widthMm', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Color, Lock, Threshold (similar structure) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Цвет RAL
                </label>
                <select
                  {...register('colorId')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Не выбрано</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.code} - {color.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Замок
                </label>
                <select
                  {...register('lockId')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Не выбрано</option>
                  {locks.map((lock) => (
                    <option key={lock.id} value={lock.id}>
                      {lock.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Порог
                </label>
                <select
                  {...register('thresholdId')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Не выбрано</option>
                  {thresholds.map((threshold) => (
                    <option key={threshold.id} value={threshold.id}>
                      {threshold.type} {threshold.heightMm ? `(${threshold.heightMm}мм)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shield Number, Delivery, Date, Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Номер щита
                </label>
                <input
                  type="text"
                  {...register('shieldNumber')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Способ доставки
                </label>
                <select
                  {...register('deliveryMethod')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Не выбрано</option>
                  <option value="самовывоз">Самовывоз</option>
                  <option value="доставка">Доставка</option>
                  <option value="доставка+монтаж">Доставка + монтаж</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Плановая дата завершения
                </label>
                <input
                  type="date"
                  {...register('plannedCompletionDate')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Общая сумма (₽)
                </label>
                <input
                  type="number"
                  {...register('totalAmount', { valueAsNumber: true })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Статус заявки
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="paused">Приостановлена</option>
                <option value="cancelled">Отменена</option>
                <option value="completed">Завершена</option>
              </select>
            </div>

            {/* Cancelled */}
            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register('isCancelled')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Заявка отменена
                </label>
              </div>
              {isCancelled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Причина отмены
                  </label>
                  <select
                    {...register('cancelReasonId')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Выберите причину</option>
                    {cancelReasons.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Paused */}
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register('isPaused')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Заявка приостановлена
                </label>
              </div>
              {isPaused && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Причина приостановки
                  </label>
                  <textarea
                    {...register('pauseReason')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Manager Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Комментарий менеджера
              </label>
              <textarea
                {...register('managerComment')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push(`/orders/${id}`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
