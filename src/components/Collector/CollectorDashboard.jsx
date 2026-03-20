// Nhập các icon minh họa từ thư viện lucide-react
import { CheckCircle2, Clock, AlertCircle, TrendingUp, MapPin, Star, LogOut } from "lucide-react";
// Nhập context xác thực và hook điều hướng
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * DỮ LIỆU GIẢ LẬP (MOCK DATA) CHO CÁC CHỈ SỐ THỐNG KÊ
 */
const stats = [
  { label: "Hoàn thành hôm nay", value: 4,  total: 6,  color: "bg-green-500", light: "bg-green-50 text-green-700", icon: CheckCircle2 },
  { label: "Đang xử lý",         value: 1,  total: null, color: "bg-blue-500",  light: "bg-blue-50 text-blue-700",   icon: Clock },
  { label: "Tổng tháng này",     value: 68, total: null, color: "bg-purple-500",light: "bg-purple-50 text-purple-700",icon: TrendingUp },
  { label: "Đánh giá trung bình",value: "4.8/5", total: null, color: "bg-yellow-500", light: "bg-yellow-50 text-yellow-700", icon: Star },
];

/**
 * DANH SÁCH CÔNG VIỆC GẦN ĐÂY (MOCK DATA)
 */
const recentTasks = [
  { id: "TK-001", address: "123 Lê Lợi, Q.1",      area: "KV 1A", type: "Nhựa",    time: "08:00", status: "Hoàn thành", rating: 5 },
  { id: "TK-002", address: "456 Nguyễn Huệ, Q.1",  area: "KV 1A", type: "Giấy",    time: "09:30", status: "Hoàn thành", rating: 4 },
  { id: "TK-003", address: "789 Pasteur, Q.3",      area: "KV 1B", type: "Kim loại",time: "11:00", status: "Đang làm",   rating: null },
  { id: "TK-004", address: "321 Hai Bà Trưng, Q.3", area: "KV 1B", type: "Nhựa",    time: "13:30", status: "Chờ",        rating: null },
  { id: "TK-005", address: "654 Võ Văn Tần, Q.3",   area: "KV 2A", type: "Giấy",    time: "15:00", status: "Chờ",        rating: null },
  { id: "TK-006", address: "987 CMT8, Q.3",          area: "KV 2A", type: "NGUY HẠI",time: "16:30", status: "Chờ",        rating: null },
];

/**
 * ĐỊNH NGHĨA MÀU SẮC THEO TRẠNG THÁI
 */
const statusStyle = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang làm":   "bg-blue-100  text-blue-700",
  "Chờ":        "bg-gray-100  text-gray-500",
};

/**
 * ĐỊNH NGHĨA MÀU SẮC THEO LOẠI RÁC
 */
const typeColor = {
  "Nhựa": "bg-purple-100 text-purple-700",
  "Giấy": "bg-orange-100 text-orange-700",
  "Kim loại": "bg-gray-100 text-gray-700",
  "NGUY HẠI": "bg-red-100 text-red-700",
};

export default function CollectorDashboard() {
  const { user } = useAuth();
  
  // Tính toán % hoàn thành trong ngày
  const completed = recentTasks.filter(t => t.status === "Hoàn thành").length;
  const total = recentTasks.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      {/* VÙNG CHỨA CÁC CARD THÔNG TIN */}
      <div className="mb-8">
          
          {/* HÀNG 1: Các chỉ số thống kê tổng quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{s.label}</p>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.light}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  {/* Hiển thị thanh tiến trình nếu mục đó có tổng số (total) */}
                  {s.total && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CARD: BIỂU ĐỒ VÒNG (Progress ring) - Tiến độ trong ngày */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
              <h2 className="text-base font-bold text-gray-800 mb-5 w-full">Tiến độ hôm nay</h2>

              {/* Vẽ vòng tròn tiến độ bằng SVG */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Vòng nền xám */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    {/* Vòng xanh hiển thị % thực tế */}
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#22c55e" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40 * pct / 100} ${2 * Math.PI * 40 * (100 - pct) / 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Chữ hiển thị ở giữa vòng tròn */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{pct}%</span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">Hoàn thành</span>
                  </div>
                </div>
              </div>

              {/* Chú thích chi tiết từng trạng thái rác */}
              <div className="w-full space-y-2 text-sm text-gray-600">
                {[
                  { label: "Hoàn thành", count: completed,                       color: "bg-green-500" },
                  { label: "Đang xử lý", count: recentTasks.filter(t=>t.status==="Đang làm").length,  color: "bg-blue-500" },
                  { label: "Còn lại",    count: recentTasks.filter(t=>t.status==="Chờ").length,        color: "bg-gray-300" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.count} nhiệm vụ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD: BẢNG DANH SÁCH CÔNG VIỆC TRONG NGÀY */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
              <h2 className="text-base font-bold text-gray-800 mb-5">Danh sách công việc hôm nay</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      {["Mã", "Địa chỉ / Khu vực", "Loại rác", "Giờ", "Trạng thái", "Đánh giá"].map(h => (
                        <th key={h} className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentTasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 px-2 text-[11px] text-gray-400 font-mono">#{t.id}</td>
                        <td className="py-3 px-2">
                          <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">{t.address}</p>
                          <span className="text-[10px] text-teal-600 font-bold">{t.area}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight ${typeColor[t.type] || "bg-gray-100 text-gray-600"}`}>{t.type}</span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 whitespace-nowrap">{t.time}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${statusStyle[t.status]}`}>{t.status}</span>
                        </td>
                        <td className="py-3 px-2">
                          {t.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-bold text-gray-700">{t.rating}</span>
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

          {/* DÒNG THỜI GIAN TUẦN HIỆN TẠI (Weekly Summary) */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4 font-bold">Hiệu suất trong tuần</h2>
            <div className="flex justify-between gap-2 min-w-[600px]">
              {[
                { day: "T2", date: "3", tasks: 5, done: 5 },
                { day: "T3", date: "4", tasks: 6, done: 6 },
                { day: "T4", date: "5", tasks: 4, done: 4 },
                { day: "T5", date: "6", tasks: 7, done: 5 },
                { day: "T6", date: "7", tasks: 6, done: 4, today: true },
                { day: "T7", date: "8", tasks: 3, done: 0 },
                { day: "CN", date: "9", tasks: 0, done: 0, off: true },
              ].map(d => (
                <div key={d.day} className={`flex-1 rounded-2xl p-4 text-center border ${d.today ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-100" : d.off ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100"}`}>
                  <p className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${d.today ? "text-emerald-50" : "text-gray-400"}`}>{d.day}</p>
                  <p className={`text-xl font-black mb-3 ${d.today ? "text-white" : "text-gray-800"}`}>{d.date}</p>
                  {!d.off ? (
                    <div className="w-full">
                      {/* Thanh tiến trình mini theo ngày */}
                      <div className={`h-1.5 rounded-full mb-2 ${d.today ? "bg-emerald-400" : "bg-gray-100"}`}>
                        <div
                          className={`h-1.5 rounded-full ${d.today ? "bg-white shadow-[0_0_8px_white]" : "bg-emerald-500"}`}
                          style={{ width: d.tasks > 0 ? `${(d.done/d.tasks)*100}%` : "0%" }}
                        />
                      </div>
                      <p className={`text-[10px] font-bold ${d.today ? "text-emerald-50" : "text-gray-500"}`}>{d.done}/{d.tasks}</p>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-300 uppercase italic">OFF</span>
                  )}
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
