import { useState } from "react";
import { ChevronLeft, ChevronRight, Shield, User, MapPin, Clock, X, CalendarDays } from "lucide-react";
import CollectorSidebar from "./CollectorSidebar";

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

const shiftColor = {
  "Ca sáng":    "bg-blue-100 border-blue-300 text-blue-700",
  "Ca chiều":   "bg-orange-100 border-orange-300 text-orange-700",
  "Ca cả ngày": "bg-purple-100 border-purple-300 text-purple-700",
};

const assignedColor = {
  "Admin": "text-red-600",
  "Quản lí khu vực": "text-indigo-600",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

export default function CollectorSchedule() {
  const today = new Date();
  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(2); // 0-indexed
  const [selected, setSelected] = useState("2026-03-06");
  const [detailShift, setDetailShift] = useState(null);

  const days = getDaysInMonth(year, month);
  const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7; // Monday first

  const prevMonth = () => month === 0 ? (setYear(y => y-1), setMonth(11)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setYear(y => y+1), setMonth(0)) : setMonth(m => m+1);

  const dateKey = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const shiftsForDay  = (d) => SHIFTS.filter(s => s.date === dateKey(d));
  const shiftsSelected= SHIFTS.filter(s => s.date === selected);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <CollectorSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-xl font-bold text-gray-800">Lịch làm việc</h1>
            <p className="text-sm text-gray-500 mt-0.5">Lịch được phân công bởi Admin hoặc Quản lí khu vực</p>
          </header>

          <main className="flex-1 p-8">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-5">
              {Object.entries(shiftColor).map(([k,v]) => (
                <span key={k} className={`text-xs px-3 py-1 rounded-full border font-medium ${v}`}>{k}</span>
              ))}
              <div className="ml-auto flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-gray-600">Phân công bởi Admin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-gray-600">Quản lí khu vực</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                  <h2 className="text-base font-bold text-gray-800">{MONTH_NAMES[month]} {year}</h2>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 mb-1">
                  {["T2","T3","T4","T5","T6","T7","CN"].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                  ))}
                </div>

                {/* Cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
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
                        className={`min-h-[72px] p-1.5 rounded-lg cursor-pointer border transition-all ${
                          isSelected ? "border-green-400 bg-green-50" :
                          isToday    ? "border-blue-300 bg-blue-50"   :
                          "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <p className={`text-xs font-semibold mb-1 text-center ${isToday ? "text-blue-600" : isSelected ? "text-green-600" : "text-gray-600"}`}>{d}</p>
                        <div className="space-y-0.5">
                          {dayShifts.slice(0,2).map(s => (
                            <div key={s.id} className={`text-[10px] px-1 py-0.5 rounded border ${shiftColor[s.type]} truncate`}>
                              {s.start} {s.area.replace("Khu vực ","KV")}
                            </div>
                          ))}
                          {dayShifts.length > 2 && <div className="text-[10px] text-gray-400 text-center">+{dayShifts.length-2}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day detail panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-green-600" />
                  <h3 className="text-base font-bold text-gray-800">
                    {selected ? `${selected.split("-")[2]}/${selected.split("-")[1]}/${selected.split("-")[0]}` : "Chọn ngày"}
                  </h3>
                </div>

                {shiftsSelected.length > 0 ? (
                  <div className="space-y-3">
                    {shiftsSelected.map(s => (
                      <div
                        key={s.id}
                        className={`rounded-xl border p-3 cursor-pointer hover:shadow-sm transition-shadow ${shiftColor[s.type]}`}
                        onClick={() => setDetailShift(s)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wide">{s.type}</span>
                          <div className="flex items-center gap-1">
                            {s.assignedBy === "Admin" ? <Shield className="w-3 h-3 text-red-500" /> : <User className="w-3 h-3 text-indigo-500" />}
                            <span className={`text-[11px] font-medium ${assignedColor[s.assignedBy]}`}>{s.assignedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{s.start} – {s.end}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />
                          <span>{s.area}, {s.district}</span>
                        </div>
                        {s.note && <p className="text-[11px] mt-1.5 italic opacity-80">{s.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Không có ca làm việc</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming shifts list */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4">Ca làm việc sắp tới</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Ngày", "Ca", "Giờ", "Khu vực", "Phân công bởi", "Ghi chú"].map(h => (
                        <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SHIFTS.sort((a,b) => a.date.localeCompare(b.date)).map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailShift(s)}>
                        <td className="py-3 px-4 text-sm text-gray-800 whitespace-nowrap">
                          {s.date.split("-").reverse().join("/")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${shiftColor[s.type]}`}>{s.type}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{s.start} – {s.end}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-teal-700">{s.area}</span>
                          <span className="text-xs text-gray-400 ml-1">• {s.district}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {s.assignedBy === "Admin" ? <Shield className="w-3 h-3 text-red-500" /> : <User className="w-3 h-3 text-indigo-500" />}
                            <span className={`text-xs font-medium ${assignedColor[s.assignedBy]}`}>{s.assignedBy}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{s.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Shift detail modal */}
      {detailShift && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetailShift(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết ca làm việc</h3>
              <button onClick={() => setDetailShift(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className={`rounded-xl p-3 mb-4 border ${shiftColor[detailShift.type]}`}>
              <p className="text-sm font-bold">{detailShift.type}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Ngày",         value: detailShift.date.split("-").reverse().join("/") },
                { label: "Giờ làm",      value: `${detailShift.start} – ${detailShift.end}` },
                { label: "Khu vực",      value: detailShift.area },
                { label: "Quận",         value: detailShift.district },
                { label: "Phân công",    value: detailShift.assignedBy },
                { label: "Ghi chú",      value: detailShift.note || "Không có ghi chú" },
              ].map(({label, value}) => (
                <div key={label} className="flex text-sm">
                  <span className="w-28 text-gray-400 shrink-0">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetailShift(null)} className="mt-5 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Đóng</button>
          </div>
        </div>
      )}
    </>
  );
}
