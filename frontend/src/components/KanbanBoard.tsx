import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, EllipsisVerticalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { ordersApi, Order } from '@/api/orders';
import toast from 'react-hot-toast';

interface Stage {
  id: string;
  name: string;
  color: string;
  status: Order['status'];
  orders: Order[];
}

const STAGES: Omit<Stage, 'orders'>[] = [
  {
    id: 'NEW',
    name: 'Новые',
    color: 'bg-blue-100 text-blue-800',
    status: 'NEW',
  },
  {
    id: 'IN_PROGRESS',
    name: 'В работе',
    color: 'bg-yellow-100 text-yellow-800',
    status: 'IN_PROGRESS',
  },
  {
    id: 'COMPLETED',
    name: 'Готово',
    color: 'bg-green-100 text-green-800',
    status: 'COMPLETED',
  },
];

const getPriorityColor = (priority: Order['priority']) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityLabel = (priority: Order['priority']) => {
  switch (priority) {
    case 'URGENT':
      return 'Срочный';
    case 'HIGH':
      return 'Высокий';
    case 'MEDIUM':
      return 'Средний';
    case 'LOW':
      return 'Низкий';
    default:
      return 'Низкий';
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAUSED':
      return 'bg-purple-100 text-purple-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const KanbanBoard: React.FC = () => {
  const router = useRouter();
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await ordersApi.findAll({ limit: 1000 }); // Get all orders

      // Group orders by status
      const ordersByStatus: Record<string, Order[]> = {
        NEW: [],
        IN_PROGRESS: [],
        COMPLETED: [],
      };

      response.data.forEach((order) => {
        // Only show NEW, IN_PROGRESS, and COMPLETED orders on Kanban
        if (['NEW', 'IN_PROGRESS', 'COMPLETED'].includes(order.status)) {
          ordersByStatus[order.status].push(order);
        }
      });

      // Build stages with orders
      const newStages: Stage[] = STAGES.map((stage) => ({
        ...stage,
        orders: ordersByStatus[stage.status] || [],
      }));

      setStages(newStages);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить заявки');
      toast.error('Не удалось загрузить заявки');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStageId = source.droppableId;
    const destStageId = destination.droppableId;
    const orderId = draggableId;

    // Optimistic UI update
    const sourceStage = stages.find((s) => s.id === sourceStageId);
    const destStage = stages.find((s) => s.id === destStageId);

    if (!sourceStage || !destStage) return;

    const sourceOrders = Array.from(sourceStage.orders);
    const destOrders =
      sourceStageId === destStageId
        ? sourceOrders
        : Array.from(destStage.orders);
    const [movedOrder] = sourceOrders.splice(source.index, 1);

    if (sourceStageId === destStageId) {
      // Reordering within the same column
      sourceOrders.splice(destination.index, 0, movedOrder);
      setStages(
        stages.map((s) =>
          s.id === sourceStageId ? { ...s, orders: sourceOrders } : s
        )
      );
    } else {
      // Moving between columns
      const updatedOrder = { ...movedOrder, status: destStage.status };
      destOrders.splice(destination.index, 0, updatedOrder);

      setStages(
        stages.map((s) => {
          if (s.id === sourceStageId) return { ...s, orders: sourceOrders };
          if (s.id === destStageId) return { ...s, orders: destOrders };
          return s;
        })
      );

      // Make API call to update status
      try {
        if (destStage.status === 'COMPLETED') {
          await ordersApi.complete(orderId);
          toast.success('Заявка завершена');
        } else if (destStage.status === 'IN_PROGRESS' && sourceStage.status === 'NEW') {
          // When moving from NEW to IN_PROGRESS, update status via API
          await ordersApi.update(orderId, { status: 'IN_PROGRESS' });
          toast.success('Заявка переведена в работу');
        } else if (destStage.status === 'NEW' && sourceStage.status !== 'NEW') {
          // Moving back to NEW
          await ordersApi.update(orderId, { status: 'NEW' });
          toast.success('Заявка возвращена в новые');
        }
        // Refresh to get updated data
        await fetchOrders();
      } catch (err: any) {
        console.error('Failed to update order status:', err);
        toast.error(err.response?.data?.message || 'Не удалось обновить статус заявки');
        // Revert optimistic update
        fetchOrders();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex space-x-4 p-6 overflow-x-auto">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-4 w-6 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
            <div className="min-h-[500px] rounded-lg bg-gray-50/50 p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4 mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />
                    <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            Ошибка загрузки
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh button */}
      <div className="flex justify-end px-6 pt-6 pb-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Обновить</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 px-6 pb-6 overflow-x-auto">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              {/* Заголовок колонки */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}
                  >
                    {stage.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {stage.orders.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => router.push('/orders?action=create')}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Создать заявку"
                  >
                    <PlusIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Колонка с задачами */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] rounded-lg p-3 space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-gray-50/50'
                    }`}
                  >
                    {stage.orders.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                        Нет заявок
                      </div>
                    ) : (
                      stage.orders.map((order, index) => (
                        <Draggable
                          key={order.id}
                          draggableId={order.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleOrderClick(order.id)}
                              className={`bg-white rounded-lg p-4 shadow-sm border ${
                                snapshot.isDragging
                                  ? 'shadow-lg border-blue-300'
                                  : 'border-gray-200'
                              } hover:shadow-md transition-shadow cursor-pointer`}
                            >
                              {/* Номер заявки */}
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-mono text-gray-500">
                                  #{order.orderNumber}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>

                              {/* Заголовок карточки */}
                              <div className="mb-3">
                                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                  {order.title}
                                </h3>
                                {order.customer && (
                                  <p className="text-xs text-gray-500 line-clamp-1">
                                    {order.customer.name}
                                  </p>
                                )}
                              </div>

                              {/* Приоритет и срок */}
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                    order.priority
                                  )}`}
                                >
                                  {getPriorityLabel(order.priority)}
                                </span>
                                {order.estimatedCompletionDate && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      order.estimatedCompletionDate
                                    ).toLocaleDateString('ru-RU')}
                                  </span>
                                )}
                              </div>

                              {/* Менеджер */}
                              {order.manager && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-600">
                                      {order.manager.name.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600 truncate">
                                    {order.manager.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
