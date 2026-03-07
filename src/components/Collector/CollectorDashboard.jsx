import { CheckCircle2, Clock, AlertCircle, TrendingUp, MapPin, Star, LogOut } from "lucide-react";
import CollectorSidebar from "./CollectorSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Hoàn thành hôm nay", value: 4,  total: 6,  color: "bg-green-500", light: "bg-green-50 text-green-700", icon: CheckCircle2 },
  { label: "Đang xử lý",         value: 1,  total: null, color: "bg-blue-500",  light: "bg-blue-50 text-blue-700",   icon: Clock },
  { label: "Tổng tháng này",     value: 68, total: null, color: "bg-purple-500",light: "bg-purple-50 text-purple-700",icon: TrendingUp },
  { label: "Đánh giá trung bình",value: "4.8/5", total: null, color: "bg-yellow-500", light: "bg-yellow-50 text-yellow-700", icon: Star },
];

const recentTasks = [
  { id: "TK-001", address: "123 Lê Lợi, Q.1",      area: "KV 1A", type: "Nhựa",    time: "08:00", status: "Hoàn thành", rating: 5 },
  { id: "TK-002", address: "456 Nguyễn Huệ, Q.1",  area: "KV 1A", type: "Giấy",    time: "09:30", status: "Hoàn thành", rating: 4 },
  { id: "TK-003", address: "789 Pasteur, Q.3",      area: "KV 1B", type: "Kim loại",time: "11:00", status: "Đang làm",   rating: null },
  { id: "TK-004", address: "321 Hai Bà Trưng, Q.3", area: "KV 1B", type: "Nhựa",    time: "13:30", status: "Chờ",        rating: null },
  { id: "TK-005", address: "654 Võ Văn Tần, Q.3",   area: "KV 2A", type: "Giấy",    time: "15:00", status: "Chờ",        rating: null },
  { id: "TK-006", address: "987 CMT8, Q.3",          area: "KV 2A", type: "NGUY HẠI",time: "16:30", status: "Chờ",        rating: null },
];

const statusStyle = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang làm":   "bg-blue-100  text-blue-700",
  "Chờ":        "bg-gray-100  text-gray-500",
};

const typeColor = {
  "Nhựa": "bg-purple-100 text-purple-700",
  "Giấy": "bg-orange-100 text-orange-700",
  "Kim loại": "bg-gray-100 text-gray-700",
  "NGUY HẠI": "bg-red-100 text-red-700",
};

export default function CollectorDashboard() {
  const { user } = useAuth();
  const completed = recentTasks.filter(t => t.status === "Hoàn thành").length;
  const total = recentTasks.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CollectorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Xin chào, {user?.full_name || "Người thu gom"} 👋</h1>
            <p className="text-sm text-gray-500">Thứ Sáu, 06/03/2026 — Khu vực: 1A, 1B</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Khu vực 1A • 1B</span>
          </div>
        </header>

        <main className="flex-1 p-8">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.light}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  {s.total && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Tiến độ</span>
                        <span>{s.value}/{s.total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${(s.value/s.total)*100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Progress ring + daily breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5">Tiến độ hôm nay</h2>

              {/* Ring */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#22c55e" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40 * pct / 100} ${2 * Math.PI * 40 * (100 - pct) / 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{pct}%</span>
                    <span className="text-xs text-gray-400">hoàn thành</span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {[
                { label: "Hoàn thành", count: completed,                       color: "bg-green-500" },
                { label: "Đang xử lý", count: recentTasks.filter(t=>t.status==="Đang làm").length,  color: "bg-blue-500" },
                { label: "Còn lại",    count: recentTasks.filter(t=>t.status==="Chờ").length,        color: "bg-gray-300" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item.count} nhiệm vụ</span>
                </div>
              ))}
            </div>

            {/* Task progress table */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5">Danh sách công việc hôm nay</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Mã", "Địa chỉ / Khu vực", "Loại rác", "Giờ", "Trạng thái", "Đánh giá"].map(h => (
                        <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentTasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 text-xs text-gray-400 font-mono">{t.id}</td>
                        <td className="py-3 px-2">
                          <p className="text-sm text-gray-800 truncate max-w-[140px]">{t.address}</p>
                          <span className="text-xs text-teal-600">{t.area}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[t.type] || "bg-gray-100 text-gray-600"}`}>{t.type}</span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 whitespace-nowrap">{t.time}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[t.status]}`}>{t.status}</span>
                        </td>
                        <td className="py-3 px-2">
                          {t.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-medium text-gray-700">{t.rating}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Weekly summary */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Tổng kết tuần này</h2>
            <div className="grid grid-cols-7 gap-2">
              {[
                { day: "T2", date: "3", tasks: 5, done: 5 },
                { day: "T3", date: "4", tasks: 6, done: 6 },
                { day: "T4", date: "5", tasks: 4, done: 4 },
                { day: "T5", date: "6", tasks: 7, done: 5 },
                { day: "T6", date: "7", tasks: 6, done: 4, today: true },
                { day: "T7", date: "8", tasks: 3, done: 0 },
                { day: "CN", date: "9", tasks: 0, done: 0, off: true },
              ].map(d => (
                <div key={d.day} className={`rounded-xl p-3 text-center ${d.today ? "bg-green-500 text-white" : d.off ? "bg-gray-50" : "bg-gray-50"}`}>
                  <p className={`text-xs font-semibold mb-1 ${d.today ? "text-green-100" : "text-gray-400"}`}>{d.day}</p>
                  <p className={`text-lg font-bold ${d.today ? "text-white" : "text-gray-800"}`}>{d.date}</p>
                  {!d.off ? (
                    <>
                      <div className={`h-1 rounded-full mt-2 mb-1 ${d.today ? "bg-green-400" : "bg-gray-200"}`}>
                        <div
                          className={`h-1 rounded-full ${d.today ? "bg-white" : "bg-green-500"}`}
                          style={{ width: d.tasks > 0 ? `${(d.done/d.tasks)*100}%` : "0%" }}
                        />
                      </div>
                      <p className={`text-xs ${d.today ? "text-green-100" : "text-gray-500"}`}>{d.done}/{d.tasks}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-300 mt-2">Nghỉ</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
