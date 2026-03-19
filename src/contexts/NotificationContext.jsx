import { createContext, useState, useEffect, useContext } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hubConnection, setHubConnection] = useState(null);

  // Fetch initial notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        try {
          const data = await notificationService.getUserNotifications(user.id);
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
          setNotifications(mapped);
          const unread = mapped.filter((n) => !n.isread).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Failed to fetch initial notifications:", error);
        }
      };

      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Set up SignalR connection
  useEffect(() => {
    if (user?.id) {
      // Deriving SignalR hub URL from the base API URL (removing /api if present)
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const hubUrl = baseUrl.replace(/\/api$/, "") + "/notificationHub";
      
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${hubUrl}?userId=${user.id}`)
        .withAutomaticReconnect()
        .build();
 
      setHubConnection(newConnection);
    } else if (hubConnection) {
      hubConnection.stop().then(() => setHubConnection(null));
    }
  }, [user]);

  // Start SignalR connection and listen for events
  useEffect(() => {
    if (hubConnection) {
      hubConnection
        .start()
        .then(() => {
          console.log("SignalR Connected for user", user.id);

          hubConnection.on("ReceiveNotification", (notification) => {
            console.log("Received real-time notification:", notification);
            const mappedNotification = {
              notificationId:
                notification.NotificationId || notification.notificationId,
              message: notification.Message || notification.message,
              reportId: notification.ReportId || notification.reportId,
              createdAt: notification.CreatedAt || notification.createdAt,
              isread:
                notification.IsRead ||
                notification.isRead ||
                notification.Isread ||
                false,
              userId: user.id || notification.UserId || notification.userId,
            };

            setNotifications((prev) => [mappedNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          });
        })
        .catch((e) => console.log("SignalR Connection Error: ", e));

      return () => {
        hubConnection.off("ReceiveNotification");
      };
    }
  }, [hubConnection]);

  const markAsRead = async (notificationId) => {
    try {
      const nid = Number(notificationId);
      await notificationService.markAsRead(nid);
      setNotifications((prev) =>
        prev.map((n) =>
          Number(n.notificationId) === nid ? { ...n, isread: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isread: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!notificationId) {
      console.error("No notificationId provided for deletion");
      return;
    }
    try {
      const nid = Number(notificationId);
      console.log("Attempting to delete notification with ID:", nid);
      await notificationService.deleteNotification(nid);
      
      setNotifications((prev) => {
        const deleted = prev.find((n) => Number(n.notificationId) === nid);
        if (deleted && !deleted.isread) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => Number(n.notificationId) !== nid);
      });
      console.log("Notification deleted successfully from UI:", nid);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.id) return;
    try {
      await notificationService.deleteAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to delete all notifications", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
