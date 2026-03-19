import { useState, useEffect } from "react";
import { Users, CalendarDays, TrendingUp, AlertCircle } from "lucide-react";
import ManagerSidebar from "./ManagerSidebar";
import NotificationDropdown from "../common/NotificationDropdown";
import { getCitizenStats } from "../../api/user";

export default function ManagerDashboard() {
  const [stats, setStats] = useState([
    { label: "Người thu gom khu vực", value: 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Ca làm hôm nay", value: 0, icon: CalendarDays, color: "text-green-600", bg: "bg-green-50" },
    { label: "Yêu cầu chờ xử lý", value: 0, icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Tỷ lệ hoàn thành (Tuần)", value: "0%", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getCitizenStats();
      if (data) {
        setStats([
          { label: "Tổng người dùng", value: data.totalCitizens, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Người dùng mới", value: data.activeCitizens, icon: CalendarDays, color: "text-green-600", bg: "bg-green-50" },
          { label: "Điểm hệ thống", value: data.totalPoints, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Yêu cầu chờ xử lý", value: 5, icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Xin chào Quản lý! 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Tổng quan hiệu suất khu vực của bạn</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow ${loading ? 'animate-pulse' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{loading ? '...' : s.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
              <div className="space-y-4">
                {[
                  { text: "Nguyễn Văn An đã hoàn thành ca làm sáng", time: "10 phút trước", status: "success" },
                  { text: "Có 2 yêu cầu thu gom mới tại đường Lê Lợi", time: "1 giờ trước", status: "warning" },
                  { text: "Cập nhật lịch làm việc tuần tới", time: "2 giờ trước", status: "info" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'success' ? 'bg-green-500' : 
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Người thu gom đang làm việc</h2>
              <div className="space-y-3">
                {[
                  { name: "Nguyễn Văn An", task: "Thu gom nhựa y tế", area: "Khu vực 1A" },
                  { name: "Trần Thị Bích", task: "Thu gom giấy báo", area: "Khu vực 1A" },
                ].map((collector, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {collector.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{collector.name}</p>
                        <p className="text-xs text-gray-500">{collector.task}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{collector.area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
