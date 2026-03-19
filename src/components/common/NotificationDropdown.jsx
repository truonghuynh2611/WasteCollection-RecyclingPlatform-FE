import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, Info, Eye, X, MoreVertical, Trash } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth, ROLES } from "../../contexts/AuthContext";
import ConfirmModal from "./ConfirmModal";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedNotif(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.isread) {
      markAsRead(notif.notificationId);
    }
    setSelectedNotif(notif);
  };

  const handleViewDetail = (e, notif) => {
    e.stopPropagation();
    if (!notif.isread) {
      markAsRead(notif.notificationId);
    }
    
    setSelectedNotif(null);

    // Navigate to respective page based on role and reportId
    if (notif.reportId) {
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.AREA_MANAGER) {
        const path = (user.role === ROLES.ADMIN || user.role === "Admin") ? "/reportManagement" : "/manager/requests";
        setIsOpen(false);
        setSelectedNotif(null);
        navigate(`${path}?reportId=${notif.reportId}`, { replace: true });
      } else if (user?.role === ROLES.CITIZEN) {
        setIsOpen(false);
        setSelectedNotif(null);
        navigate(`/report-waste?reportId=${notif.reportId}`, { replace: true });
      } else if (user?.role === ROLES.COLLECTOR) {
        setIsOpen(false);
        setSelectedNotif(null);
        navigate(`/collector/tasks?reportId=${notif.reportId}`, { replace: true });
      }
    }
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
    if (selectedNotif?.notificationId === notificationId) {
      setSelectedNotif(null);
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllConfirm(true);
  };

  const executeDeleteAll = () => {
    deleteAllNotifications();
    setSelectedNotif(null);
    setShowDeleteAllConfirm(false);
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => { setIsOpen(!isOpen); setSelectedNotif(null); }}
        className="relative p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-white px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col" style={{ maxHeight: "520px" }}>
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Đã đọc
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={handleDeleteAll}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Xóa tất cả thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa hết
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Detail View - when a notification is selected */}
          {selectedNotif && (
            <div className="p-4 border-b border-gray-100 bg-emerald-50/40 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Chi tiết thông báo</h4>
                <button 
                  onClick={() => setSelectedNotif(null)} 
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm transition-all hover:bg-white/80">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{selectedNotif.message}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{formatDate(selectedNotif.createdAt)}</span>
                  {selectedNotif.reportId ? (
                    <button 
                      onClick={(e) => handleViewDetail(e, selectedNotif)}
                      className="text-[10px] font-bold text-white bg-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors uppercase tracking-tight"
                    >
                      Xem chi tiết
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-tight">Hệ thống</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: "thin" }}>
            {notifications.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-sm font-medium">Chưa có thông báo nào</p>
                <p className="text-xs text-gray-300 mt-1">Thông báo mới sẽ hiển thị ở đây</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notif, idx) => (
                  <li 
                    key={notif.notificationId || idx}
                    className={`group relative border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${
                      selectedNotif?.notificationId === notif.notificationId 
                        ? "bg-emerald-50/60" 
                        : !notif.isread 
                          ? "bg-green-50/40 hover:bg-green-50/70" 
                          : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notif.isread && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 rounded-r-full" />
                    )}
                    
                    <div className="flex items-start gap-3 p-3 pl-4" onClick={() => handleNotificationClick(notif)}>
                      {/* Icon */}
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        !notif.isread 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Info className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notif.isread ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDelete(e, notif.notificationId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
      <ConfirmModal 
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={executeDeleteAll}
        title="Xóa tất cả thông báo"
        message="Bạn có chắc chắn muốn xóa toàn bộ thông báo? Thao tác này không thể hoàn tác."
        confirmText="Xóa tất cả"
      />
    </div>
  );
}
