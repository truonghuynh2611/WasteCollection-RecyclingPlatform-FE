import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, X } from "lucide-react";
import ManagerSidebar from "./ManagerSidebar";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const initialSchedules = [
  { id: 1, date: "2026-03-06", title: "Ca Sáng - Tuyến A", collector: "Nguyễn Văn An", area: "Khu vực 1A", time: "07:00 - 11:00", color: "bg-green-500", type: "morning" },
  { id: 2, date: "2026-03-06", title: "Ca Chiều - Tuyến B", collector: "Trần Thị Bích", area: "Khu vực 1A", time: "13:00 - 17:00", color: "bg-blue-500", type: "afternoon" },
];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function ManagerSchedule() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: "", collector: "", area: "Khu vực 1A", time: "" });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1); } else setCurrentMonth(m => m-1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1); } else setCurrentMonth(m => m+1); };

  const getDateStr = (day) => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const getSchedulesForDay = (day) => schedules.filter(s => s.date === getDateStr(day));
  const selectedSchedules = selectedDate ? schedules.filter(s => s.date === getDateStr(selectedDate)) : [];

  const addSchedule = () => {
    if (!newSchedule.title || !selectedDate) return;
    setSchedules(prev => [...prev, {
      id: Date.now(), date: getDateStr(selectedDate), ...newSchedule, color: "bg-indigo-500", type: "morning"
    }]);
    setNewSchedule({ title: "", collector: "", area: "Khu vực 1A", time: "" });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Quản lý lịch khu vực</h1>
            <p className="text-sm text-gray-500 mt-0.5">Phân công lịch trình cho các người thu gom thuộc khu vực 1A</p>
          </div>
          <button
            onClick={() => { if (selectedDate) setShowAddModal(true); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              selectedDate ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            {selectedDate ? `Thêm lịch ngày ${selectedDate}` : "Chọn ngày để lên lịch"}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">{MONTHS[currentMonth]} {currentYear}</h2>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const daySchedules = getSchedulesForDay(day);
                  const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
                  const isSelected = selectedDate === day;
                  return (
                    <button
                      key={day} onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`min-h-[72px] p-1.5 rounded-lg border text-left transition-all ${
                        isSelected ? "border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500"
                        : isToday ? "border-indigo-300 bg-indigo-50/50"
                        : "border-transparent hover:border-gray-200 hover:bg-gray-50 bg-white"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${isToday ? "text-indigo-600" : "text-gray-700"}`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {daySchedules.slice(0, 2).map(s => (
                          <div key={s.id} className={`${s.color} rounded px-1.5 py-0.5`}><p className="text-white text-[10px] truncate leading-tight">{s.title}</p></div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{selectedDate ? `Lịch ngày ${selectedDate}/${currentMonth + 1}/${currentYear}` : "Chi tiết ngày"}</h3>
              {selectedDate ? (
                selectedSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSchedules.map(s => (
                      <div key={s.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="flex items-start gap-2 mb-3">
                          <div className={`w-2.5 h-2.5 ${s.color} rounded-full mt-1.5 shrink-0`} />
                          <p className="text-sm font-bold text-gray-800 leading-tight">{s.title}</p>
                        </div>
                        <div className="space-y-2 pl-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600"><Clock className="w-3.5 h-3.5" /> <span>{s.time}</span></div>
                          <div className="flex items-center gap-2 text-xs text-gray-600"><User className="w-3.5 h-3.5" /> <span className="font-medium text-gray-800">{s.collector}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10"><p className="text-sm text-gray-400">Trống</p></div>
                )
              ) : (
                <div className="text-center py-10"><p className="text-sm text-gray-400">Chọn một ngày để xem</p></div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Thêm ca làm việc</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Tên ca (VD: Ca sáng tuyến A)", key: "title" },
                { label: "Người thu gom (VD: Nguyễn Văn An)", key: "collector" },
                { label: "Thời gian (VD: 07:00 - 11:00)", key: "time" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text" value={newSchedule[key]} onChange={e => setNewSchedule(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Hủy</button>
              <button onClick={addSchedule} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
