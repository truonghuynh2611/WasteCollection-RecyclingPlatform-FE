import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, X } from "lucide-react";
import Sidebar from "../Layouts/Sidebar";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const initialSchedules = [
  { id: 1, date: "2026-03-06", title: "Thu gom Quận 1 - Sáng", collector: "Nguyễn Văn An", area: "Khu vực 1A", time: "07:00 - 11:00", color: "bg-green-500", type: "morning" },
  { id: 2, date: "2026-03-06", title: "Thu gom Quận 1 - Chiều", collector: "Trần Thị Bích", area: "Khu vực 1B", time: "13:00 - 17:00", color: "bg-blue-500", type: "afternoon" },
  { id: 3, date: "2026-03-08", title: "Thu gom Quận 2", collector: "Lê Văn Cường", area: "Khu vực 2A", time: "08:00 - 12:00", color: "bg-purple-500", type: "morning" },
  { id: 4, date: "2026-03-10", title: "Thu gom Quận 3 - Sáng", collector: "Phạm Minh Dũng", area: "Khu vực 3A", time: "07:30 - 11:30", color: "bg-orange-500", type: "morning" },
  { id: 5, date: "2026-03-12", title: "Thu gom Quận 7", collector: "Hoàng Thị Emilia", area: "Khu vực 7A", time: "07:00 - 11:00", color: "bg-teal-500", type: "morning" },
  { id: 6, date: "2026-03-15", title: "Tổng vệ sinh cuối tuần", collector: "Vũ Quốc Fang", area: "Khu vực 1A, 1B", time: "06:00 - 12:00", color: "bg-red-500", type: "all-day" },
  { id: 7, date: "2026-03-18", title: "Thu gom Quận 9", collector: "Nguyễn Văn An", area: "Khu vực 9A", time: "08:00 - 12:00", color: "bg-indigo-500", type: "morning" },
  { id: 8, date: "2026-03-22", title: "Thu gom Quận 12", collector: "Trần Thị Bích", area: "Khu vực 12A", time: "13:00 - 17:00", color: "bg-pink-500", type: "afternoon" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function ScheduleManagement() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: "", collector: "", area: "", time: "" });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getDateStr = (day) => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getSchedulesForDay = (day) => {
    const dateStr = getDateStr(day);
    return schedules.filter(s => s.date === dateStr);
  };

  const selectedSchedules = selectedDate ? schedules.filter(s => s.date === getDateStr(selectedDate)) : [];

  const addSchedule = () => {
    if (!newSchedule.title || !selectedDate) return;
    const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-teal-500", "bg-pink-500"];
    setSchedules(prev => [...prev, {
      id: Date.now(),
      date: getDateStr(selectedDate),
      ...newSchedule,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: "morning"
    }]);
    setNewSchedule({ title: "", collector: "", area: "", time: "" });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý lịch thu gom</h1>
                <p className="text-gray-500 mt-1">Lập lịch và phân công cho người thu gom rác theo khu vực</p>
              </div>
              <button
                onClick={() => { if (selectedDate) setShowAddModal(true); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  selectedDate ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                {selectedDate ? `Thêm lịch ngày ${selectedDate}` : "Chọn ngày để thêm lịch"}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Lịch tháng này", value: schedules.filter(s => s.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`)).length, color: "text-gray-800", bg: "bg-white" },
                { label: "Ca sáng", value: schedules.filter(s => s.type === "morning").length, color: "text-orange-600", bg: "bg-orange-50" },
                { label: "Ca chiều", value: schedules.filter(s => s.type === "afternoon").length, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Sự kiện đặc biệt", value: schedules.filter(s => s.type === "all-day").length, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-gray-200 p-5 shadow-sm`}>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`blank-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const daySchedules = getSchedulesForDay(day);
                    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
                    const isSelected = selectedDate === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : day)}
                        className={`min-h-[72px] p-1.5 rounded-lg border text-left transition-all ${
                          isSelected ? "border-green-500 bg-green-50 shadow-sm"
                          : isToday ? "border-green-300 bg-green-50"
                          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${isToday ? "text-green-600" : "text-gray-700"}`}>{day}</span>
                        <div className="mt-1 space-y-0.5">
                          {daySchedules.slice(0, 2).map(s => (
                            <div key={s.id} className={`${s.color} rounded px-1 py-0.5`}>
                              <p className="text-white text-xs truncate leading-tight">{s.title.split(" - ")[0]}</p>
                            </div>
                          ))}
                          {daySchedules.length > 2 && (
                            <p className="text-xs text-gray-400">+{daySchedules.length - 2} lịch</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Side Panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {selectedDate
                    ? `Lịch ngày ${selectedDate}/${currentMonth + 1}/${currentYear}`
                    : "Chọn một ngày để xem lịch"
                  }
                </h3>
                {selectedDate ? (
                  selectedSchedules.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSchedules.map(s => (
                        <div key={s.id} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`w-2 h-2 ${s.color} rounded-full mt-1.5 shrink-0`} />
                            <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                          </div>
                          <div className="space-y-1.5 pl-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{s.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>{s.staff}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{s.area}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">Chưa có lịch nào cho ngày này</p>
                      <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-green-600 hover:underline">
                        + Thêm lịch mới
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Nhấn vào một ngày trên lịch để xem chi tiết</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Thêm lịch — ngày {selectedDate}/{currentMonth + 1}/{currentYear}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Tiêu đề lịch *", key: "title", placeholder: "VD: Thu gom Quận 1 - Sáng" },
                { label: "Nhân viên phụ trách", key: "staff", placeholder: "VD: Nguyễn Văn An" },
                { label: "Khu vực", key: "area", placeholder: "VD: Khu vực 1A" },
                { label: "Thời gian", key: "time", placeholder: "VD: 07:00 - 11:00" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={newSchedule[key]}
                    onChange={e => setNewSchedule(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Hủy
              </button>
              <button onClick={addSchedule} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                Thêm lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
