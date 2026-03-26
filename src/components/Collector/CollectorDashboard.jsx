import { useState, useEffect } from "react";
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  MapPin, Star, Package, Check, ClipboardCheck 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getWasteReportsByCollector, confirmWasteReport, processWasteReport } from "../../api/waste";
import { getCollectorDashboardStats } from "../../api/dashboard";
import { toast } from "react-hot-toast";

const statusStyle = {
  "Pending": "bg-gray-100 text-gray-500",
  "Assigned": "bg-blue-100 text-blue-700",
  "OnTheWay": "bg-indigo-100 text-indigo-700",
  "Collected": "bg-green-100 text-green-700",
  "Failed": "bg-red-100 text-red-700",
};

const statusLabel = {
  "Pending": "Chờ xử lý",
  "Assigned": "Mới (Đã gán)",
  "OnTheWay": "Đang đến",
  "Collected": "Đã hoàn thành",
  "Failed": "Thất bại",
};

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedToday: 0,
    processing: 0,
    totalMonth: 0,
    rating: "4.8/5",
    teamName: "N/A"
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.collectorId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error on new fetch
      
      // Lấy UserID thực tế từ localStorage hoặc Context
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || storedUser?.id;

      if (!userId) {
        console.warn("CollectorDashboard: No user ID found.");
        setLoading(false);
        return;
      }

      // Fetch stats and tasks in parallel
      const [statsRes, reportsRes] = await Promise.all([
        getCollectorDashboardStats(),
        getWasteReportsByCollector(user.collectorId) // Assuming this is the correct function for tasks
      ]);

      const reportsData = reportsRes.success ? reportsRes.data : reportsRes;
      setTasks(Array.isArray(reportsData) ? reportsData : []);
      
      if (statsRes) {
        setStats({
          completedToday: statsRes.teamCompletedToday ?? statsRes.TeamCompletedToday ?? 0,
          processing: statsRes.myAssignedTasks ?? statsRes.MyAssignedTasks ?? 0,
          totalMonth: statsRes.teamTotalCompleted ?? statsRes.TeamTotalCompleted ?? 0,
          rating: "4.8/5", // Static for now
          teamName: statsRes.teamName ?? statsRes.TeamName ?? "N/A"
        });
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Không thể tải dữ liệu bảng điều khiển");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = () => fetchData(); // Alias for compatibility

  const handleConfirm = async (reportId) => {
    try {
      const res = await confirmWasteReport(reportId, user.collectorId);
      if (res.success || res) {
        toast.success("Đã xác nhận đang di chuyển đến điểm thu gom");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Lỗi khi xác nhận nhiệm vụ");
    }
  };

  const handleComplete = async (reportId) => {
    // For now, simpler processing without a full result modal. 
    // In a real app, you'd open a modal to select weight/actual waste type.
    if (!window.confirm("Xác nhận đã thu gom thành công rác tại điểm này?")) return;
    
    try {
      const res = await processWasteReport({
        reportId: reportId,
        collectorId: user.collectorId,
        status: 3, // Collected
        note: "Thu gom thành công"
      });
      if (res.success || res) {
        toast.success("Đã hoàn thành thu gom rác!");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật kết quả: " + (error.response?.data?.message || ""));
    }
  };

  const pct = tasks.length > 0 ? Math.round((stats.completedToday / tasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Chào buổi sáng, {user?.fullName}!</h1>
        <p className="text-gray-500">Đây là danh sách nhiệm vụ thu gom của đội bạn hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Hoàn thành hôm nay", value: stats.completedToday, color: "bg-green-500", light: "bg-green-50 text-green-700", icon: CheckCircle2 },
          { label: "Nhiệm vụ mới", value: stats.processing, color: "bg-blue-500", light: "bg-blue-50 text-blue-700", icon: Clock },
          { label: "Tổng tháng này", value: stats.totalMonth, color: "bg-purple-500", light: "bg-purple-50 text-purple-700", icon: TrendingUp },
          { label: "Đánh giá", value: stats.rating, color: "bg-yellow-500", light: "bg-yellow-50 text-yellow-700", icon: Star },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-bold uppercase">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.light}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <h2 className="text-base font-bold text-gray-800 mb-5 w-full">Tiến độ hôm nay</h2>
          <div className="relative w-32 h-32 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f8fafc" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#10b981" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40 * pct / 100} 999`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{pct}%</span>
              <span className="text-[10px] text-gray-400 uppercase font-medium">Xong</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-gray-50">
              <span className="text-gray-500">Đã hoàn thành</span>
              <span className="font-bold text-green-600">{stats.completedToday}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-50">
              <span className="text-gray-500">Đang chờ/xử lý</span>
              <span className="font-bold text-blue-600">{stats.processing}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">Danh sách công việc</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-gray-400">Đang tải dữ liệu...</div>
            ) : tasks.length === 0 ? (
              <div className="py-10 text-center text-gray-400 italic">Không có nhiệm vụ nào được gán cho đội của bạn.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-3">Khách hàng / Địa chỉ</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map((task) => (
                    <tr key={task.reportId} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <p className="text-sm font-bold text-gray-800">{task.citizen?.fullName || "Người dùng"}</p>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{task.area?.name || "Chưa cập nhật địa chỉ"}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle[task.status] || "bg-gray-100"}`}>
                          {statusLabel[task.status] || task.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {task.status === "Assigned" && (
                          <button
                            onClick={() => handleConfirm(task.reportId)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1 ml-auto"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Xác nhận
                          </button>
                        )}
                        {task.status === "OnTheWay" && (
                          <button
                            onClick={() => handleComplete(task.reportId)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm flex items-center gap-1 ml-auto"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Hoàn thành
                          </button>
                        )}
                        {(task.status === "Collected" || task.status === "Failed") && (
                          <span className="text-xs text-gray-400 italic">Đã đóng</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
