import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  customer: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  dueDate: string;
  assignedTo?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  orders: Order[];
}

const mockStages: Stage[] = [
  {
    id: '1',
    name: 'Новые',
    color: 'bg-blue-100 text-blue-800',
    orders: [
      {
        id: '1',
        customer: 'ООО "СтройМастер"',
        title: 'Металлическая дверь 2000x2100',
        priority: 'high',
        status: 'Новые',
        dueDate: '2024-10-28',
        assignedTo: 'Иванов И.И.'
      },
      {
        id: '2',
        customer: 'ИП Петров',
        title: 'Входная группа',
        priority: 'medium',
        status: 'Новые',
        dueDate: '2024-10-30',
      }
    ]
  },
  {
    id: '2',
    name: 'В работе',
    color: 'bg-yellow-100 text-yellow-800',
    orders: [
      {
        id: '3',
        customer: 'ООО "Альфа"',
        title: 'Пожарные двери',
        priority: 'high',
        status: 'В работе',
        dueDate: '2024-10-26',
        assignedTo: 'Сидоров А.А.'
      }
    ]
  },
  {
    id: '3',
    name: 'Контроль качества',
    color: 'bg-purple-100 text-purple-800',
    orders: [
      {
        id: '4',
        customer: 'ООО "ТехСтрой"',
        title: 'Двери для склада',
        priority: 'medium',
        status: 'Контроль качества',
        dueDate: '2024-10-25',
        assignedTo: 'Кузнецов В.В.'
      }
    ]
  },
  {
    id: '4',
    name: 'Готово',
    color: 'bg-green-100 text-green-800',
    orders: [
      {
        id: '5',
        customer: 'ИП Смирнов',
        title: 'Тамбурные двери',
        priority: 'low',
        status: 'Готово',
        dueDate: '2024-10-24',
        assignedTo: 'Попов Д.С.'
      }
    ]
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
      return 'Низкий';
    default:
      return 'Низкий';
  }
};

export const KanbanBoard: React.FC = () => {
  const [stages, setStages] = React.useState<Stage[]>(mockStages);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Если перетаскивание в ту же колонку
    if (source.droppableId === destination.droppableId) {
      const stage = stages.find(s => s.id === source.droppableId);
      if (!stage) return;

      const newOrders = Array.from(stage.orders);
      const [reorderedOrder] = newOrders.splice(source.index, 1);
      newOrders.splice(destination.index, 0, reorderedOrder);

      const newStages = stages.map(s =>
        s.id === source.droppableId ? { ...s, orders: newOrders } : s
      );
      setStages(newStages);
    } else {
      // Перетаскивание между колонками
      const sourceStage = stages.find(s => s.id === source.droppableId);
      const destStage = stages.find(s => s.id === destination.droppableId);

      if (!sourceStage || !destStage) return;

      const sourceOrders = Array.from(sourceStage.orders);
      const destOrders = Array.from(destStage.orders);
      const [movedOrder] = sourceOrders.splice(source.index, 1);

      const updatedOrder = { ...movedOrder, status: destStage.name };
      destOrders.splice(destination.index, 0, updatedOrder);

      const newStages = stages.map(s => {
        if (s.id === source.droppableId) return { ...s, orders: sourceOrders };
        if (s.id === destination.droppableId) return { ...s, orders: destOrders };
        return s;
      });

      setStages(newStages);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 p-6 overflow-x-auto">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            {/* Заголовок колонки */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}>
                  {stage.name}
                </span>
                <span className="text-sm text-gray-500">
                  {stage.orders.length}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <PlusIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
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
                  {stage.orders.map((order, index) => (
                    <Draggable key={order.id} draggableId={order.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded-lg p-4 shadow-sm border ${
                            snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
                          } hover:shadow-md transition-shadow cursor-pointer`}
                        >
                          {/* Заголовок карточки */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 mb-1">
                                {order.title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {order.customer}
                              </p>
                            </div>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>

                          {/* Приоритет и срок */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                              {getPriorityLabel(order.priority)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.dueDate).toLocaleDateString('ru-RU')}
                            </span>
                          </div>

                          {/* Исполнитель */}
                          {order.assignedTo && (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {order.assignedTo.charAt(0)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600">
                                {order.assignedTo}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
