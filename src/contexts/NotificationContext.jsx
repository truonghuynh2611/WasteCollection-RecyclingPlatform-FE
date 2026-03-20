// Nhập các hook cần thiết từ React
import { createContext, useState, useEffect, useContext } from "react";
// Nhập thư viện SignalR để hỗ trợ giao tiếp thời gian thực (Real-time) với ASP.NET Core Backend
import * as signalR from "@microsoft/signalr";
// Nhập AuthContext để lấy ID người dùng hiện tại
import { useAuth } from "./AuthContext";
// Nhập service xử lý gọi API thông báo
import { notificationService } from "../services/notificationService";

// Khởi tạo context cho thông báo
const NotificationContext = createContext();

/**
 * useNotification: Hook tùy chỉnh để truy cập nhanh vào context thông báo
 */
export const useNotification = () => useContext(NotificationContext);

/**
 * NotificationProvider: Hợp phần cung cấp trạng thái và xử lý logic thông báo toàn cục
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth(); // Lấy thông tin người dùng đang đăng nhập
  const [notifications, setNotifications] = useState([]); // Danh sách thông báo
  const [unreadCount, setUnreadCount] = useState(0); // Số lượng thông báo chưa đọc
  const [hubConnection, setHubConnection] = useState(null); // Đối tượng kết nối SignalR Hub

  /**
   * Hiệu ứng: Tải danh sách thông báo ban đầu từ Database khi người dùng đăng nhập thành công
   */
  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        try {
          // Gọi API lấy dữ liệu thông báo của người dùng
          const data = await notificationService.getUserNotifications(user.id);
          // Chuẩn hóa dữ liệu (Mapping) vì Backend có thể trả về các trường theo PascalCase hoặc camelCase
          const mapped = (data || []).map((n) => ({
            notificationId: n.notificationId || n.NotificationId || n.id || n.Id,
            message: n.message || n.Message,
            reportId: n.reportId || n.ReportId,
            createdAt: n.createdAt || n.CreatedAt,
            isread:
              n.isread !== undefined
                ? n.isread
                : n.IsRead !== undefined
                ? n.IsRead
                : n.Isread !== undefined
                ? n.Isread
                : false,
            userId: n.userId || n.UserId,
          }));
          
          // Cập nhật danh sách và đếm số lượng thông báo chưa đọc
          setNotifications(mapped);
          const unread = mapped.filter((n) => !n.isread).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Lỗi khi tải thông báo ban đầu:", error);
        }
      };

      fetchNotifications();
    } else {
      // Nếu đăng xuất, xóa toàn bộ thông báo trong bộ nhớ
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  /**
   * Hiệu ứng: Khởi tạo đối tượng kết nối SignalR Hub
   */
  useEffect(() => {
    if (user?.id) {
      // Xác định URL của SignalR Hub dựa trên cấu hình môi trường
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const hubUrl = baseUrl.replace(/\/api$/, "") + "/notificationHub";
      
      // Xây dựng kết nối với cơ chế tự động kết nối lại khi mất mạng (Automatic Reconnect)
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${hubUrl}?userId=${user.id}`)
        .withAutomaticReconnect()
        .build();
 
      setHubConnection(newConnection);
    } else if (hubConnection) {
      // Nếu người dùng đăng xuất, ngắt kết nối Hub
      hubConnection.stop().then(() => setHubConnection(null));
    }
  }, [user]);

  /**
   * Hiệu ứng: Bắt đầu kết nối SignalR và lắng nghe các sự kiện gửi từ Server
   */
  useEffect(() => {
    if (hubConnection) {
      hubConnection
        .start()
        .then(() => {
          console.log("Đã kết nối SignalR cho người dùng:", user.id);

          /**
           * Lắng nghe sự kiện 'ReceiveNotification' từ Backend gửi về theo thời gian thực
           */
          hubConnection.on("ReceiveNotification", (notification) => {
            console.log("Nhận thông báo thời gian thực:", notification);
            // Chuẩn hóa dữ liệu nhận được
            const mappedNotification = {
              notificationId: notification.NotificationId || notification.notificationId,
              message: notification.Message || notification.message,
              reportId: notification.ReportId || notification.reportId,
              createdAt: notification.CreatedAt || notification.createdAt,
              isread: notification.IsRead || notification.isRead || notification.Isread || false,
              userId: user.id || notification.UserId || notification.userId,
            };

            // Thêm thông báo mới vào đầu danh sách và tăng số lượng chưa đọc
            setNotifications((prev) => [mappedNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          });
        })
        .catch((e) => console.log("Lỗi kết nối SignalR: ", e));

      // Dọn dẹp: Hủy lắng nghe sự kiện khi Component bị hủy (Unmount)
      return () => {
        hubConnection.off("ReceiveNotification");
      };
    }
  }, [hubConnection]);

  /**
   * Hàm đánh dấu một thông báo là đã đọc
   */
  const markAsRead = async (notificationId) => {
    try {
      const nid = Number(notificationId);
      await notificationService.markAsRead(nid);
      // Cập nhật trạng thái 'isread' trong danh sách hiện có mà không cần gọi lại Web API
      setNotifications((prev) =>
        prev.map((n) =>
          Number(n.notificationId) === nid ? { ...n, isread: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  /**
   * Hàm đánh dấu toàn bộ thông báo của người dùng là đã đọc
   */
  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isread: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi khi đánh dấu toàn bộ đã đọc:", error);
    }
  };

  /**
   * Hàm xóa một thông báo cụ thể
   */
  const deleteNotification = async (notificationId) => {
    if (!notificationId) return;
    try {
      const nid = Number(notificationId);
      await notificationService.deleteNotification(nid);
      
      // Loại bỏ thông báo khỏi danh sách quản lý của React
      setNotifications((prev) => {
        const deleted = prev.find((n) => Number(n.notificationId) === nid);
        if (deleted && !deleted.isread) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => Number(n.notificationId) !== nid);
      });
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  };

  /**
   * Hàm xóa toàn bộ thông báo trong lịch sử của người dùng
   */
  const deleteAllNotifications = async () => {
    if (!user?.id) return;
    try {
      await notificationService.deleteAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi khi xóa toàn bộ thông báo:", error);
    }
  };

  // Cung cấp các hàm và biến ra ngoài thông qua Value của Context
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
