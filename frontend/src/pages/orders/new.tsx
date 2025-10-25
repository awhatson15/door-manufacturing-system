import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Validation schema
const createOrderSchema = z.object({
  customerId: z.string().uuid('Выберите заказчика'),
  mainNumber: z.string().optional(),
  doorTypeId: z.string().uuid('Выберите тип двери').optional().or(z.literal('')),
  heightMm: z.number().min(1, 'Минимум 1 мм').optional().or(z.nan()),
  widthMm: z.number().min(1, 'Минимум 1 мм').optional().or(z.nan()),
  colorId: z.string().uuid('Выберите цвет').optional().or(z.literal('')),
  lockId: z.string().uuid('Выберите замок').optional().or(z.literal('')),
  thresholdId: z.string().uuid('Выберите порог').optional().or(z.literal('')),
  shieldNumber: z.string().optional(),
  deliveryMethod: z.enum(['самовывоз', 'доставка', 'доставка+монтаж']).optional().or(z.literal('')),
  plannedCompletionDate: z.string().optional(),
  totalAmount: z.number().min(0).optional().or(z.nan()),
  managerComment: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Reference {
  id: string;
  name?: string;
  code?: string;
  model?: string;
  type?: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [doorTypes, setDoorTypes] = useState<Reference[]>([]);
  const [colors, setColors] = useState<Reference[]>([]);
  const [locks, setLocks] = useState<Reference[]>([]);
  const [thresholds, setThresholds] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      heightMm: undefined,
      widthMm: undefined,
      totalAmount: undefined,
    },
  });

  // Load customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1000 },
        });
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error('Failed to load customers:', error);
        toast.error('Не удалось загрузить список заказчиков');
      }
    };
    fetchCustomers();
  }, []);

  // Load references
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [doorTypesRes, colorsRes, locksRes, thresholdsRes] = await Promise.all([
          axios.get(`${API_URL}/api/references/door-types/active`, { headers }),
          axios.get(`${API_URL}/api/references/ral-colors/active`, { headers }),
          axios.get(`${API_URL}/api/references/locks/active`, { headers }),
          axios.get(`${API_URL}/api/references/thresholds/active`, { headers }),
        ]);

        setDoorTypes(doorTypesRes.data);
        setColors(colorsRes.data);
        setLocks(locksRes.data);
        setThresholds(thresholdsRes.data);
      } catch (error) {
        console.error('Failed to load references:', error);
        toast.error('Не удалось загрузить справочники');
      }
    };
    fetchReferences();
  }, []);

  const onSubmit = async (data: CreateOrderFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Prepare data (remove empty strings)
      const payload = {
        ...data,
        doorTypeId: data.doorTypeId || undefined,
        colorId: data.colorId || undefined,
        lockId: data.lockId || undefined,
        thresholdId: data.thresholdId || undefined,
        deliveryMethod: data.deliveryMethod || undefined,
        heightMm: data.heightMm || undefined,
        widthMm: data.widthMm || undefined,
        totalAmount: data.totalAmount || undefined,
      };

      await axios.post(`${API_URL}/api/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Заявка успешно создана');
      router.push('/orders');
    } catch (error: any) {
      console.error('Failed to create order:', error);
      const message = error.response?.data?.message || 'Не удалось создать заявку';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Новая заявка | Door Manufacturing</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Создание новой заявки
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Заказчик <span className="text-red-500">*</span>
              </label>
              <select
                {...register('customerId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Выберите заказчика</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
              )}
            </div>

            {/* Main Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Основной номер (опционально)
              </label>
              <input
                type="text"
                {...register('mainNumber')}
                placeholder="Например: ЗАК-2025-001"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500">
                Внутренний номер будет создан автоматически в формате YYYY-XXXX
              </p>
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
                  placeholder="2000"
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
                  placeholder="900"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Color */}
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

            {/* Lock */}
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

            {/* Threshold */}
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

            {/* Shield Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Номер щита (для противопожарных дверей)
              </label>
              <input
                type="text"
                {...register('shieldNumber')}
                placeholder="ЩИТ-001"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Delivery Method */}
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

            {/* Planned Completion Date */}
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

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Общая сумма (₽)
              </label>
              <input
                type="number"
                {...register('totalAmount', { valueAsNumber: true })}
                placeholder="50000"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Manager Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Комментарий менеджера
              </label>
              <textarea
                {...register('managerComment')}
                rows={3}
                placeholder="Дополнительная информация о заказе..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/orders')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание...' : 'Создать заявку'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
