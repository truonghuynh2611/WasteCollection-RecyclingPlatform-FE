import { useState, useEffect } from "react";
import { Search, CheckCircle2, Clock, AlertCircle, X, MapPin, Star, ChevronDown } from "lucide-react";
import CollectorSidebar from "./CollectorSidebar";
import { getMyTasks, updateTaskStatus as apiUpdateTaskStatus } from "../../api/task";

const statusStyle = {
  "Completed": "bg-green-100 text-green-700",
  "Processing": "bg-blue-100  text-blue-700",
  "Pending": "bg-yellow-100 text-yellow-700",
  "Assigned": "bg-indigo-100 text-indigo-700",
};

const statusMapVn = {
  "Pending": "Chờ xử lý",
  "Assigned": "Đã phân công",
  "Processing": "Đang làm",
  "Completed": "Hoàn thành",
  "Cancelled": "Đã hủy"
};

const priorityStyle = {
  "Khẩn":      "bg-red-100 text-red-700",
  "Cao":        "bg-orange-100 text-orange-700",
  "Bình thường":"bg-gray-100 text-gray-600",
  "Thấp":       "bg-slate-100 text-slate-500",
};
const typeColor = {
  "Nhựa": "text-purple-600 bg-purple-50",
  "Giấy": "text-orange-600 bg-orange-50",
  "Kim loại": "text-gray-600 bg-gray-100",
  "Nguy hại": "text-red-600 bg-red-50",
};
const STATUS_OPTIONS = ["Pending", "Processing", "Completed"];

export default function CollectorTasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detail, setDetail]   = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filtered = tasks.filter(t => {
    const addressMatch = (t.address || "").toLowerCase().includes(search.toLowerCase());
    const idMatch = String(t.reportId).includes(search);
    const matchSearch = addressMatch || idMatch;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openDetail = (task) => { setDetail(task); setNewStatus(task.status); };
  
  const handleUpdateStatus = async () => {
    try {
      await apiUpdateTaskStatus(detail.reportId, newStatus);
      setDetail(null);
      fetchTasks();
    } catch (error) {
      alert("Cập nhật trạng thái thất bại.");
    }
  };

  const counts = {
    all: tasks.length,
    "Pending": tasks.filter(t => t.status === "Pending").length,
    "Processing":  tasks.filter(t => t.status === "Processing").length,
    "Completed":tasks.filter(t => t.status === "Completed").length,
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <CollectorSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-xl font-bold text-gray-800">Quản lý công việc</h1>
            <p className="text-sm text-gray-500 mt-0.5">Danh sách nhiệm vụ được phân công</p>
          </header>

          <main className="flex-1 p-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tất cả",      key: "all",         icon: AlertCircle,  color: "text-gray-600 bg-gray-50" },
                { label: "Chờ xử lý",  key: "Pending",     icon: AlertCircle,  color: "text-yellow-600 bg-yellow-50" },
                { label: "Đang làm",   key: "Processing",  icon: Clock,        color: "text-blue-600 bg-blue-50" },
                { label: "Hoàn thành", key: "Completed",   icon: CheckCircle2, color: "text-green-600 bg-green-50" },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    onClick={() => setFilterStatus(c.key)}
                    className={`bg-white rounded-xl border p-4 text-left transition-all shadow-sm ${
                      filterStatus === c.key ? "border-green-400 ring-2 ring-green-100" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${c.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{counts[c.key]}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm địa chỉ hoặc mã nhiệm vụ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-20 text-center text-gray-400 italic">Đang tải danh sách nhiệm vụ...</div>
                ) : filtered.length > 0 ? (
                  <table className="w-full min-w-[750px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {["Mã", "Địa chỉ / Khu vực", "Loại rác", "Ưu tiên", "Thời gian", "Phân công bởi", "Trạng thái", ""].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(t => (
                        <tr key={t.reportId} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetail(t)}>
                          <td className="py-3.5 px-4 text-xs font-mono text-gray-400">#{t.reportId}</td>
                          <td className="py-3.5 px-4">
                            <p className="text-sm text-gray-800 truncate max-w-[180px]">{t.address || "Chưa xác định"}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-teal-500" />
                              <span className="text-xs text-teal-600">{t.area || "N/A"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor[t.wasteType] || "bg-gray-100 text-gray-600"}`}>{t.wasteType}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle[t.priority] || "bg-gray-100"}`}>{t.priority}</span>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-gray-600 whitespace-nowrap">{t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : "N/A"}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-indigo-600 font-medium">{t.assignedBy}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle[t.status] || "bg-gray-100"}`}>
                              {statusMapVn[t.status] || t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {t.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-medium text-gray-600">{t.rating}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 text-center text-gray-400 italic font-medium">Không tìm thấy nhiệm vụ nào.</div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Detail / Update modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 transition-all" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">#{detail.reportId}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Chi tiết nhiệm vụ</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Địa chỉ",       value: detail.address },
                { label: "Khu vực",       value: detail.area },
                { label: "Loại rác",      value: detail.wasteType },
                { label: "Ưu tiên",       value: detail.priority },
                { label: "Thời gian",     value: detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : "N/A" },
                { label: "Phân công bởi", value: detail.assignedBy },
                { label: "Ghi chú",       value: detail.note || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <span className="w-28 text-gray-400 shrink-0 font-medium">{label}</span>
                  <span className="text-gray-800 font-semibold">{value}</span>
                </div>
              ))}
            </div>

            {/* Status update */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide text-xs">Cập nhật trạng thái</label>
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-gray-50"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusMapVn[s] || s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setDetail(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">Đóng</button>
              <button onClick={handleUpdateStatus} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-colors">Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
