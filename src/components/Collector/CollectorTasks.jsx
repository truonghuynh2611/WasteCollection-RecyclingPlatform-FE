import { useState } from "react";
import { Search, CheckCircle2, Clock, AlertCircle, X, MapPin, Star, ChevronDown } from "lucide-react";
import CollectorSidebar from "./CollectorSidebar";

const ALL_TASKS = [
  { id: "TK-001", address: "123 Đường Lê Lợi, Phường Bến Nghé", area: "Khu vực 1A", district: "Quận 1", type: "Nhựa",     priority: "Cao",    time: "08:00 06/03", assignedBy: "Admin",          status: "Hoàn thành", note: "Công dân thân thiện", rating: 5 },
  { id: "TK-002", address: "456 Nguyễn Huệ, Phường Bến Nghé",   area: "Khu vực 1A", district: "Quận 1", type: "Giấy",     priority: "Bình thường", time: "09:30 06/03", assignedBy: "Quản lí khu vực", status: "Hoàn thành", note: "",    rating: 4 },
  { id: "TK-003", address: "789 Pasteur, Phường 6",              area: "Khu vực 1B", district: "Quận 3", type: "Kim loại", priority: "Cao",    time: "11:00 06/03", assignedBy: "Admin",          status: "Đang làm",   note: "",    rating: null },
  { id: "TK-004", address: "321 Hai Bà Trưng, Phường 8",         area: "Khu vực 1B", district: "Quận 3", type: "Nhựa",     priority: "Thấp",   time: "13:30 06/03", assignedBy: "Quản lí khu vực", status: "Chờ xử lý",  note: "",    rating: null },
  { id: "TK-005", address: "654 Võ Văn Tần, Phường 5",           area: "Khu vực 2A", district: "Quận 3", type: "Giấy",     priority: "Bình thường", time: "15:00 06/03", assignedBy: "Admin",  status: "Chờ xử lý",  note: "",    rating: null },
  { id: "TK-006", address: "987 Cách Mạng Tháng 8, Phường 7",   area: "Khu vực 2A", district: "Quận 3", type: "Nguy hại", priority: "Khẩn",   time: "16:30 06/03", assignedBy: "Quản lí khu vực", status: "Chờ xử lý",  note: "",    rating: null },
  { id: "TK-007", address: "11 Nguyễn Thị Minh Khai, P.Đa Kao",  area: "Khu vực 1A", district: "Quận 1", type: "Giấy", priority: "Thấp",   time: "08:00 05/03", assignedBy: "Admin",          status: "Hoàn thành", note: "",    rating: 5 },
  { id: "TK-008", address: "22 Trần Phú, Phường 4",              area: "Khu vực 1B", district: "Quận 5", type: "Nhựa",     priority: "Cao",    time: "10:00 05/03", assignedBy: "Quản lí khu vực", status: "Hoàn thành", note: "",    rating: 3 },
];

const statusStyle = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang làm":   "bg-blue-100  text-blue-700",
  "Chờ xử lý": "bg-yellow-100 text-yellow-700",
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
const STATUS_OPTIONS = ["Chờ xử lý", "Đang làm", "Hoàn thành"];

export default function CollectorTasks() {
  const [tasks, setTasks]     = useState(ALL_TASKS);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detail, setDetail]   = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const filtered = tasks.filter(t => {
    const matchSearch = t.address.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openDetail = (task) => { setDetail(task); setNewStatus(task.status); };
  const updateStatus = () => {
    setTasks(prev => prev.map(t => t.id === detail.id ? { ...t, status: newStatus } : t));
    setDetail(null);
  };

  const counts = {
    all: tasks.length,
    "Chờ xử lý": tasks.filter(t => t.status === "Chờ xử lý").length,
    "Đang làm":  tasks.filter(t => t.status === "Đang làm").length,
    "Hoàn thành":tasks.filter(t => t.status === "Hoàn thành").length,
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
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tất cả",      key: "all",         icon: AlertCircle,  color: "text-gray-600 bg-gray-50" },
                { label: "Chờ xử lý",  key: "Chờ xử lý",  icon: AlertCircle,  color: "text-yellow-600 bg-yellow-50" },
                { label: "Đang làm",   key: "Đang làm",    icon: Clock,        color: "text-blue-600 bg-blue-50" },
                { label: "Hoàn thành", key: "Hoàn thành",  icon: CheckCircle2, color: "text-green-600 bg-green-50" },
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
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
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetail(t)}>
                        <td className="py-3.5 px-4 text-xs font-mono text-gray-400">{t.id}</td>
                        <td className="py-3.5 px-4">
                          <p className="text-sm text-gray-800 truncate max-w-[180px]">{t.address}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-teal-500" />
                            <span className="text-xs text-teal-600">{t.area}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor[t.type] || "bg-gray-100 text-gray-600"}`}>{t.type}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle[t.priority]}`}>{t.priority}</span>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600 whitespace-nowrap">{t.time}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-indigo-600 font-medium">{t.assignedBy}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle[t.status]}`}>{t.status}</span>
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
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Detail / Update modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{detail.id}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Chi tiết nhiệm vụ</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Địa chỉ",       value: detail.address },
                { label: "Khu vực",       value: detail.area },
                { label: "Loại rác",      value: detail.type },
                { label: "Ưu tiên",       value: detail.priority },
                { label: "Thời gian",     value: detail.time },
                { label: "Phân công bởi", value: detail.assignedBy },
                { label: "Ghi chú",       value: detail.note || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <span className="w-28 text-gray-400 shrink-0">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
              {detail.rating && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-28 text-gray-400">Đánh giá</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < detail.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status update */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cập nhật trạng thái</label>
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setDetail(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Đóng</button>
              <button onClick={updateStatus} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
