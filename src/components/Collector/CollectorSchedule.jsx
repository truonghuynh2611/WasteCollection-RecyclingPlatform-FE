// Nhập các hook từ React
import { useState } from "react";
// Nhập các icon điều hướng và minh họa từ lucide-react
import { ChevronLeft, ChevronRight, Shield, User, MapPin, Clock, X, CalendarDays } from "lucide-react";
// Nhập Sidebar dành riêng cho Collector
import CollectorSidebar from "./CollectorSidebar";

/**
 * DANH SÁCH CA LÀM VIỆC (MOCK DATA)
 * Bao gồm: ngày, giờ, khu vực, người phân công, loại ca và ghi chú
 */
const SHIFTS = [
  { id: 1,  date: "2026-03-02", start: "07:00", end: "12:00", area: "Khu vực 1A", district: "Quận 1", assignedBy: "Admin",            type: "Ca sáng",  note: "" },
  { id: 2,  date: "2026-03-03", start: "07:00", end: "12:00", area: "Khu vực 1A", district: "Quận 1", assignedBy: "Quản lí khu vực",  type: "Ca sáng",  note: "" },
  { id: 3,  date: "2026-03-04", start: "13:00", end: "18:00", area: "Khu vực 1B", district: "Quận 3", assignedBy: "Admin",            type: "Ca chiều", note: "Khu vực có nhiều rác nguy hại" },
  { id: 4,  date: "2026-03-05", start: "07:00", end: "12:00", area: "Khu vực 1A", district: "Quận 1", assignedBy: "Quản lí khu vực",  type: "Ca sáng",  note: "" },
  { id: 5,  date: "2026-03-05", start: "13:00", end: "18:00", area: "Khu vực 2A", district: "Quận 3", assignedBy: "Admin",            type: "Ca chiều", note: "" },
  { id: 6,  date: "2026-03-06", start: "07:00", end: "12:00", area: "Khu vực 1A", district: "Quận 1", assignedBy: "Admin",            type: "Ca sáng",  note: "" },
  { id: 7,  date: "2026-03-06", start: "13:00", end: "17:00", area: "Khu vực 1B", district: "Quận 3", assignedBy: "Quản lí khu vực",  type: "Ca chiều", note: "Tăng ca" },
  { id: 8,  date: "2026-03-09", start: "07:00", end: "12:00", area: "Khu vực 1A", district: "Quận 1", assignedBy: "Admin",            type: "Ca sáng",  note: "" },
  { id: 9,  date: "2026-03-10", start: "07:00", end: "12:00", area: "Khu vực 2A", district: "Quận 3", assignedBy: "Quản lí khu vực",  type: "Ca sáng",  note: "" },
  { id: 10, date: "2026-03-11", start: "13:00", end: "18:00", area: "Khu vực 1B", district: "Quận 3", assignedBy: "Admin",            type: "Ca chiều", note: "" },
  { id: 11, date: "2026-03-12", start: "07:00", end: "18:00", area: "Khu vực 1A", district: "Quận 1", assignedBy: "Admin",            type: "Ca cả ngày", note: "Sự kiện thu gom lớn" },
];

/**
 * ĐỊNH NGHĨA MÀU SẮC THEO LOẠI CA LÀM VIỆC
 */
const shiftColor = {
  "Ca sáng":    "bg-blue-100 border-blue-300 text-blue-700",
  "Ca chiều":   "bg-orange-100 border-orange-300 text-orange-700",
  "Ca cả ngày": "bg-purple-100 border-purple-300 text-purple-700",
};

/**
 * MÀU SẮC PHÂN BIỆT NGƯỜI PHÂN CÔNG
 */
const assignedColor = {
  "Admin": "text-red-600",
  "Quản lí khu vực": "text-indigo-600",
};

/**
 * HÀM TIỆN ÍCH CHO LỊCH (CALENDAR)
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate(); // Trả về số ngày của tháng
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // Trả về thứ của ngày đầu tiên (0=Chủ Nhật)
}

const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

export default function CollectorSchedule() {
  const today = new Date();
  
  // States quản lý năm, tháng đang xem và ngày đang chọn
  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(2); // Tháng 3 (0-indexed)
  const [selected, setSelected] = useState("2026-03-06");
  
  // State lưu thông tin ca làm việc để hiển thị trong Modal chi tiết
  const [detailShift, setDetailShift] = useState(null);

  const days = getDaysInMonth(year, month);
  // Điều chỉnh để Thứ 2 là ngày đầu tuần trong lịch (0=Thứ 2)
  const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7;

  // Chuyển tháng trước/sau
  const prevMonth = () => month === 0 ? (setYear(y => y-1), setMonth(11)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setYear(y => y+1), setMonth(0)) : setMonth(m => m+1);

  // Tạo key định dạng YYYY-MM-DD để so sánh với dữ liệu Mock
  const dateKey = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  
  // Lọc danh sách ca làm việc theo ngày
  const shiftsForDay  = (d) => SHIFTS.filter(s => s.date === dateKey(d));
  const shiftsSelected= SHIFTS.filter(s => s.date === selected);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* SIDEBAR BÊN TRÁI */}
        <CollectorSidebar />

        {/* NỘI DUNG CHÍNH BÊN PHẢI */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* HEADER TRANG LỊCH */}
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-xl font-bold text-gray-800">Lịch làm việc</h1>
            <p className="text-sm text-gray-500 mt-0.5">Lịch được phân công bởi Admin hoặc Quản lí khu vực</p>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            
            {/* PHẦN CHÚ THÍCH (Legend) */}
            <div className="flex items-center gap-4 mb-5">
              {Object.entries(shiftColor).map(([k,v]) => (
                <span key={k} className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-tight ${v}`}>{k}</span>
              ))}
              <div className="ml-auto flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <span>Bởi Admin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bởi Quản lí</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CỘT TRÁI: GIAO DIỆN LỊCH (Calendar) */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-100 p-5">
                {/* Điều hướng tháng */}
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                  <h2 className="text-lg font-black text-gray-800">{MONTH_NAMES[month]} {year}</h2>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>

                {/* Tiêu đề các thứ trong tuần */}
                <div className="grid grid-cols-7 mb-2 border-b border-gray-50 pb-2">
                  {["T2","T3","T4","T5","T6","T7","CN"].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</div>
                  ))}
                </div>

                {/* Các ô ngày trong tháng */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Ô rỗng nếu ngày đầu tiên không phải Thứ 2 */}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="min-h-[80px]" />)}
                  
                  {Array.from({ length: days }).map((_, i) => {
                    const d = i + 1;
                    const key = dateKey(d);
                    const dayShifts = shiftsForDay(d);
                    const isToday = key === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
                    const isSelected = key === selected;
                    
                    return (
                      <div
                        key={d}
                        onClick={() => setSelected(key)}
                        className={`min-h-[85px] p-2 rounded-xl cursor-pointer border transition-all duration-200 ${
                          isSelected ? "border-emerald-500 bg-emerald-50/50 shadow-inner" :
                          isToday    ? "border-blue-300 bg-blue-50/30"   :
                          "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <p className={`text-xs font-black mb-2 ${isToday ? "text-blue-600" : isSelected ? "text-emerald-600" : "text-gray-400"}`}>{d}</p>
                        <div className="space-y-1">
                          {/* Hiển thị tối đa 2 ca trực tiếp trên ô lịch */}
                          {dayShifts.slice(0,2).map(s => (
                            <div key={s.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border truncate ${shiftColor[s.type]}`}>
                              {s.start} - {s.area.replace("Khu vực ","KV")}
                            </div>
                          ))}
                          {/* Nếu có nhiều hơn 2 ca thì hiển thị số lượng còn lại */}
                          {dayShifts.length > 2 && <div className="text-[9px] font-bold text-gray-400 text-center">+{dayShifts.length-2} ca khác</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CỘT PHẢI: CHI TIẾT CA LÀM TRONG NGÀY ĐANG CHỌN */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                  <CalendarDays className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-black text-gray-800">
                    {selected ? `${selected.split("-")[2]}/${selected.split("-")[1]}/${selected.split("-")[0]}` : "Chọn ngày"}
                  </h3>
                </div>

                {shiftsSelected.length > 0 ? (
                  <div className="space-y-4">
                    {shiftsSelected.map(s => (
                      <div
                        key={s.id}
                        className={`rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all active:scale-95 ${shiftColor[s.type]}`}
                        onClick={() => setDetailShift(s)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/50 px-2 py-0.5 rounded-full">{s.type}</span>
                          <div className="flex items-center gap-1">
                            {s.assignedBy === "Admin" ? <Shield className="w-3 h-3 text-red-500" /> : <User className="w-3 h-3 text-indigo-500" />}
                            <span className={`text-[10px] font-black uppercase tracking-tight ${assignedColor[s.assignedBy]}`}>{s.assignedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs mb-2 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{s.start} – {s.end}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 mt-0.5" />
                          <span>{s.area}, {s.district}</span>
                        </div>
                        {s.note && <p className="text-[10px] mt-3 italic opacity-70 bg-white/30 p-2 rounded-lg border border-black/5 line-clamp-2">{s.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-300">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">Không có ca làm</p>
                  </div>
                )}
              </div>
            </div>

            {/* BẢNG TỔNG HỢP: DANH SÁCH CA LÀM VIỆC DẠNG DANH SÁCH */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-base font-black text-gray-800 uppercase tracking-tight">Tất cả ca làm việc sắp tới</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50 text-gray-400">
                      {["Ngày làm", "Loại ca", "Thời gian", "Vị trí phân công", "Người phân công", "Ghi chú"].map(h => (
                        <th key={h} className="text-left py-3 px-6 text-[10px] font-black uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SHIFTS.sort((a,b) => a.date.localeCompare(b.date)).map(s => (
                      <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer group" onClick={() => setDetailShift(s)}>
                        <td className="py-4 px-6 text-sm font-bold text-gray-800">
                          {s.date.split("-").reverse().join("/")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${shiftColor[s.type]}`}>{s.type}</span>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-600 tabular-nums">{s.start} – {s.end}</td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-emerald-700">{s.area}</span>
                          <span className="text-[10px] text-gray-400 ml-1 font-bold uppercase tracking-tighter">• {s.district}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            {s.assignedBy === "Admin" ? <Shield className="w-3.5 h-3.5 text-red-500" /> : <User className="w-3.5 h-3.5 text-indigo-500" />}
                            <span className={`text-[11px] font-bold uppercase ${assignedColor[s.assignedBy]}`}>{s.assignedBy}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400 italic group-hover:text-gray-600 transition-colors">{s.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL CHI TIẾT CA LÀM VIỆC (Hộp thoại nổi) */}
      {detailShift && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setDetailShift(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Chi tiết ca làm</h3>
                <button onClick={() => setDetailShift(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className={`rounded-2xl p-4 mb-6 border shadow-sm ${shiftColor[detailShift.type]}`}>
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Loại ca làm việc</p>
                <p className="text-lg font-black uppercase">{detailShift.type}</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Ngày làm",      value: detailShift.date.split("-").reverse().join("/"), icon: CalendarDays },
                  { label: "Thời gian",     value: `${detailShift.start} – ${detailShift.end}`, icon: Clock },
                  { label: "Khu vực",       value: detailShift.area, icon: MapPin },
                  { label: "Quận/Huyện",    value: detailShift.district, icon: MapPin },
                  { label: "Phân công",     value: detailShift.assignedBy, icon: Shield },
                  { label: "Ghi chú",       value: detailShift.note || "Không có ghi chú đặc biệt", icon: User },
                ].map(({label, value, icon: Icon}) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                       <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{label}</p>
                      <p className="text-sm font-bold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setDetailShift(null)} 
                className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-100 active:scale-95"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hoạt ảnh CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
}
