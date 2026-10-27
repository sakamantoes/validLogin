// services/notificationApi.js
import { useState } from "react";
import api from "./api";

export const GetAllNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  const params = new URLSearchParams({
    page,
    limit,
    unreadOnly: unreadOnly.toString()
  });
  
  const res = await api.get(`/api/notification?${params}`);
  return res.data;
};

export const GetUnreadCount = async () => {
  const res = await api.get('/api/notification/unread/count');
  return res.data;
};

export const MarkAsRead = async (notificationId) => {
  const res = await api.put(`/api/notification/${notificationId}/read`);
  return res.data;
};

export const MarkAllAsRead = async () => {
  const res = await api.put('/api/notification/mark-all-read');
  return res.data;
};

export const DeleteNotification = async (notificationId) => {
  const res = await api.delete(`/api/notification/${notificationId}`);
  return res.data;
};


// Get recent system notifications for admin dashboard
export const getRecentSystemNotifications = async (limit = 5) => {
  const res = await api.get(`/api/notification/admin/recent?limit=${limit}`);
  return res.data;
};

// React hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async (page = 1, unreadOnly = false) => {
    setLoading(true);
    try {
      const data = await GetAllNotifications(page, 20, unreadOnly);
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsReadHandler = async (notificationId) => {
    try {
      await MarkAsRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const markAllAsReadHandler = async () => {
    try {
      await MarkAllAsRead();
      await fetchNotifications();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteHandler = async (notificationId) => {
    try {
      await DeleteNotification(notificationId);
      await fetchNotifications();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead: markAsReadHandler,
    markAllAsRead: markAllAsReadHandler,
    deleteNotification: deleteHandler,
  };
};