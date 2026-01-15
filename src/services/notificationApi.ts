import apiClient from '@/lib/axios';
import { Notification, NotificationCreate, NotificationType } from '@/types';

// Notification endpoints from NotificationController - Base path: /notifications

export const notificationApi = {
    // CRUD Operations
    create: async (notification: NotificationCreate): Promise<Notification> => {
        const response = await apiClient.post<Notification>('/notifications', notification);
        return response.data;
    },

    getById: async (notificationId: number): Promise<Notification> => {
        const response = await apiClient.get<Notification>(`/notifications/${notificationId}`);
        return response.data;
    },

    getAll: async (): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>('/notifications');
        return response.data;
    },

    getByFleetManagerId: async (fleetManagerId: number): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>(`/notifications/fleet-manager/${fleetManagerId}`);
        return response.data;
    },

    getByType: async (type: NotificationType): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>(`/notifications/type/${type}`);
        return response.data;
    },

    // Priority removed as it does not exist in backend Entity or Enums

    getUnread: async (fleetManagerId: number): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>(`/notifications/fleet-manager/${fleetManagerId}/unread`);
        return response.data;
    },

    markAsRead: async (notificationId: number): Promise<Notification> => {
        const response = await apiClient.put<Notification>(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async (fleetManagerId: number): Promise<void> => {
        await apiClient.put(`/notifications/fleet-manager/${fleetManagerId}/read-all`);
    },

    delete: async (notificationId: number): Promise<void> => {
        await apiClient.delete(`/notifications/${notificationId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/notifications/count');
        return response.data;
    },

    countUnread: async (fleetManagerId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/notifications/fleet-manager/${fleetManagerId}/count/unread`);
        return response.data;
    },

    // Admin-specific methods
    getByAdminId: async (adminId: number): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>(`/notifications/admin/${adminId}`);
        return response.data;
    },

    getUnreadByAdminId: async (adminId: number): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>(`/notifications/admin/${adminId}/unread`);
        return response.data;
    },

    countUnreadByAdminId: async (adminId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/notifications/admin/${adminId}/unread/count`);
        return response.data;
    },

    markAllAsReadByAdminId: async (adminId: number): Promise<void> => {
        await apiClient.patch(`/notifications/admin/${adminId}/read-all`);
    },
};

export default notificationApi;
