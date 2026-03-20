// Nhập axiosClient đã được cấu hình sẵn với Interceptors (để tự động đính kèm Token)
import axiosClient from '../api/axiosClient';

// Cấu hình URL cơ sở cho API thông báo lấy từ biến môi trường
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/Notification`;

/**
 * Service quản lý các yêu cầu HTTP liên quan đến thông báo.
 */
export const notificationService = {
  /**
   * Lấy toàn bộ danh sách thông báo của một người dùng cụ thể.
   * @param {number|string} userId - ID của người dùng cần lấy thông báo.
   */
  getUserNotifications: async (userId) => {
    try {
      const response = await axiosClient.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo:', error);
      throw error;
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc của người dùng.
   * @param {number|string} userId - ID của người dùng.
   */
  getUnreadCount: async (userId) => {
    try {
      const response = await axiosClient.get(`${API_URL}/user/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu một thông báo cụ thể là đã đọc.
   * @param {number} notificationId - ID của thông báo.
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosClient.put(`${API_URL}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu toàn bộ thông báo của người dùng là đã đọc.
   * @param {number|string} userId - ID của người dùng.
   */
  markAllAsRead: async (userId) => {
    try {
      const response = await axiosClient.put(`${API_URL}/user/${userId}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
      throw error;
    }
  },

  /**
   * Xóa một thông báo khỏi hệ thống.
   * @param {number} notificationId - ID của thông báo cần xóa.
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await axiosClient.delete(`${API_URL}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      throw error;
    }
  },

  /**
   * Xóa toàn bộ lịch sử thông báo của một người dùng.
   * @param {number|string} userId - ID của người dùng.
   */
  deleteAllNotifications: async (userId) => {
    try {
      const response = await axiosClient.delete(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa toàn bộ thông báo:', error);
      throw error;
    }
  }
};
