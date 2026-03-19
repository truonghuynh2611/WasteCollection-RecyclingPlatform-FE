import axios from 'axios';

const API_URL = 'http://localhost:5000/api/Notification';

export const notificationService = {
  getUserNotifications: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`${API_URL}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/user/${userId}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(`${API_URL}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  deleteAllNotifications: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
};
