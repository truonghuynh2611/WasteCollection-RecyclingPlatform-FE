// Nhập các hook từ React
import { useState, useEffect } from "react";
// Nhập các icon minh họa từ thư viện lucide-react
import { Users, CalendarDays, TrendingUp, AlertCircle, Clock } from "lucide-react";
// Nhập Sidebar dành riêng cho Manager
import ManagerSidebar from "./ManagerSidebar";
// Nhập component thả xuống hiển thị thông báo
import NotificationDropdown from "../common/NotificationDropdown";
// Nhập API service để lấy số liệu thống kê
import { getAdminDashboardStats } from "../../api/dashboard";

/**
 * COMPONENT BẢNG ĐIỀU KHIỂN DÀNH CHO QUẢN LÝ (MANAGER)
 * Hiển thị tổng quan số liệu và hoạt động trong khu vực
 */
export default function ManagerDashboard() {
  // State lưu trữ các chỉ số thống kê (Stats)
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * EFFECT: Tải số liệu thống kê khi component được nạp
   */
  useEffect(() => {
    fetchStats();
  }, []);

  /**
   * HÀM GỌI API LẤY DỮ LIỆU THỐNG KÊ
   */
  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardStats();
      if (data) {
        setStatsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Tổng báo cáo", value: statsData?.totalReports || 0, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Chờ phê duyệt", value: statsData?.pendingReports || 0, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Tổng cư dân", value: statsData?.totalCitizens || 0, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "Điểm đã cấp", value: statsData?.totalPointsAwarded || 0, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR BÊN TRÁI */}
      <ManagerSidebar />

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* THANH ĐẦU TRANG (Header) */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Xin chào Quản lý! 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Tổng quan hiệu suất toàn hệ thống</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          
          {/* HÀNG 1: HIỂN THỊ CÁC CARD CHỈ SỐ (STATS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow ${loading ? 'animate-pulse' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {loading ? '...' : (typeof s.value === 'number' ? s.value.toLocaleString() : s.value)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY (Timeline) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
                    <button onClick={fetchStats} className="text-sm text-emerald-600 hover:underline">Làm mới</button>
                </div>
              <div className="space-y-6">
                {statsData?.recentActivities?.length > 0 ? (
                    statsData.recentActivities.map((item, i) => (
                    <div key={i} className="flex gap-4 relative">
                        {i !== statsData.recentActivities.length - 1 && (
                            <div className="absolute left-[7px] top-6 w-0.5 h-10 bg-gray-100" />
                        )}
                        <div className="mt-1.5 relative z-10">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                                item.status === 'Collected' ? 'bg-green-500' : 
                                item.status === 'Pending' ? 'bg-blue-500' : 
                                item.status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-800 font-medium">{item.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(item.timestamp).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm italic text-center py-4">Chưa có hoạt động nào.</p>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: TRẠNG THÁI HIỆN TẠI (Stats Overview) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Trạng thái hệ thống</h2>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                            {statsData?.activeTeams || 0}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Đội thu gom hoạt động</span>
                    </div>
                    <span className="text-xs text-blue-600 font-bold">TRỰC TUYẾN</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                            {statsData?.completedReports || 0}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Yêu cầu đã hoàn tất</span>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold">THÀNH CÔNG</span>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold">
                            {statsData?.processingReports || 0}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Đang được xử lý</span>
                    </div>
                    <span className="text-xs text-amber-600 font-bold">TIẾN HÀNH</span>
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
