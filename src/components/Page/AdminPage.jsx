import { useState, useEffect } from "react";
// Nhập các icon minh họa từ thư viện lucide-react
import { Zap, Users as Users2, Truck, CheckCircle, RefreshCcw } from "lucide-react";
// Nhập Sidebar chung định nghĩa trong thư mục Layouts
import Sidebar from "../Layouts/Sidebar";
import { getAdminDashboardStats } from "../../api/dashboard";
import { toast } from "react-hot-toast";

/**
 * COMPONENT TRANG QUẢN TRỊ (ADMIN DASHBOARD)
 * Hiển thị các số liệu thống kê tổng thể và biểu đồ xu hướng
 */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Không thể tải thống kê bảng điều khiển");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR BÊN TRÁI */}
      <Sidebar />

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto p-8">
          <div className="w-full">
            
            {/* PHẦN ĐẦU: TIÊU ĐỀ VÀ LỜI CHÀO */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Tổng quan hoạt động
                </h1>
                <p className="text-gray-600">
                  Chào mừng trở lại! Hệ thống đang hoạt động ổn định.
                </p>
              </div>
              <button 
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>

            {/* HÀNG CÁC CARD THỐNG KÊ NHANH (STATS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {/* Card: Tổng số yêu cầu hiện có */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Tổng yêu cầu
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : (stats?.totalReports ?? stats?.TotalReports ?? 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Báo cáo</p>
              </div>

              {/* Card: Yêu cầu đang chờ phê duyệt (Pending) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Chờ phê duyệt
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">!</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : (stats?.pendingReports ?? stats?.PendingReports ?? 0)}
                </p>
                <p className="text-xs text-orange-600 font-medium mt-1">Cần xử lý</p>
              </div>

              {/* Card: Yêu cầu đang xử lý */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Đang xử lý
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : (stats?.processingReports ?? stats?.ProcessingReports ?? 0)}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">Đang thực hiện</p>
              </div>

              {/* Card: Đã hoàn thành */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-green-500">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Hoàn thành
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : (stats?.completedReports ?? stats?.CompletedReports ?? 0)}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">Tổng hoàn tất</p>
              </div>

              {/* Card: Người dùng hệ thống */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Cư dân
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Users2 className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : (stats?.totalCitizens ?? stats?.TotalCitizens ?? 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Tài khoản</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  Hoạt động gần đây
                  {stats?.recentActivities?.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] rounded-full uppercase font-bold tracking-wider">Mới</span>
                  )}
                </h2>
                <div className="space-y-6">
                  {loading ? (
                    <div className="py-10 text-center text-gray-400 text-sm">Đang tải...</div>
                  ) : stats?.recentActivities?.length > 0 ? (
                    stats.recentActivities.map((item, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i !== stats.recentActivities.length - 1 && (
                          <div className="absolute left-[7px] top-6 w-0.5 h-10 bg-gray-50" />
                        )}
                        <div className="mt-1.5 relative z-10">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                            item.status === 'Collected' ? 'bg-green-500' : 
                            item.status === 'Pending' ? 'bg-blue-500' : 
                            item.status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">
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

              {/* BIỂU ĐỒ XU HƯỚNG (SVG ĐỘNG NHẸ) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Hiệu quả thu gom
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Số lượng yêu cầu mỗi trạng thái
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Xong
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Đang làm
                     </div>
                  </div>
                </div>

                <div className="relative h-64 flex items-end justify-between gap-4 px-4">
                   {[
                     { label: 'Tổng', value: stats?.totalReports ?? stats?.TotalReports ?? 0, color: 'bg-gray-100', text: 'text-gray-400' },
                     { label: 'Chờ', value: stats?.pendingReports ?? stats?.PendingReports ?? 0, color: 'bg-orange-100', text: 'text-orange-500' },
                     { label: 'Làm', value: stats?.processingReports ?? stats?.ProcessingReports ?? 0, color: 'bg-blue-100', text: 'text-blue-500' },
                     { label: 'Xong', value: stats?.completedReports ?? stats?.CompletedReports ?? 0, color: 'bg-green-100', text: 'text-green-500' },
                   ].map((bar, i) => {
                     const maxVal = Math.max(stats?.totalReports ?? stats?.TotalReports ?? 1, 10);
                     const heightPct = (bar.value / maxVal) * 100;
                     return (
                       <div key={i} className="flex-1 flex flex-col items-center gap-3">
                          <div className="relative w-full flex flex-col items-center">
                             <div 
                               className={`w-full ${bar.color} rounded-xl transition-all duration-1000 ease-out flex items-center justify-center`}
                               style={{ height: loading ? '0%' : `${Math.max(heightPct, 5)}%`, minHeight: '30px' }}
                             >
                                <span className={`text-xs font-bold ${bar.text}`}>{bar.value}</span>
                             </div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bar.label}</span>
                       </div>
                     )
                   })}
                </div>

                {/* Phân tích loại rác (Donut Chart tối giản) */}
                <div className="mt-12 flex items-center justify-center gap-12 pt-8 border-t border-gray-50">
                    <div className="flex flex-col items-center">
                        <p className="text-2xl font-bold text-gray-800">
                          {stats?.activeTeams ?? stats?.ActiveTeams ?? 0}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đội thu gom</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="flex flex-col items-center">
                        <p className="text-2xl font-bold text-gray-800">
                          {(stats?.totalPointsAwarded ?? stats?.TotalPointsAwarded ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm đã cấp</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
