// Экспорт всех API модулей для удобного импорта
export { default as authApi } from './auth';
export type { LoginRequest, RegisterRequest, LoginResponse, UserProfile } from './auth';

export { default as ordersApi } from './orders';
export type { Order, OrderStage, CreateOrderRequest, UpdateOrderRequest, QueryOrdersRequest, OrderStatistics } from './orders';

export { default as customersApi } from './customers';
export type { Customer, CreateCustomerRequest, UpdateCustomerRequest, QueryCustomersRequest, CustomerStatistics } from './customers';

export { default as usersApi } from './users';
export type { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, UserStatistics } from './users';

export { default as stagesApi } from './stages';
export type { Stage, CreateStageRequest, UpdateStageRequest, QueryStagesRequest } from './stages';

export { default as filesApi } from './files';
export type { FileEntity, CreateFileRequest, UpdateFileRequest, QueryFilesRequest, FileStatistics } from './files';

export { default as commentsApi } from './comments';
export type { Comment, CreateCommentRequest, UpdateCommentRequest, QueryCommentsRequest } from './comments';

export { default as notificationsApi } from './notifications';
export type { Notification, CreateNotificationRequest, QueryNotificationsRequest, NotificationStatistics } from './notifications';

// Экспорт клиента и утилит
export { default as apiClient, api, uploadFile, downloadFile } from './client';
export type { ApiResponse, PaginatedResponse, ApiError } from './client';