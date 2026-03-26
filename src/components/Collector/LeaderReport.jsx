import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllCollectors } from "../../api/team";
import { taskService } from "../../api/task";
import {
  FileText, Send, CheckCircle2, MapPin, Clock,
  Scale, StickyNote, ChevronRight, X, AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";

const statusLabel = {
  Collected: "Hoàn thành",
  "Hoàn thành": "Hoàn thành",
  2: "Hoàn thành",
};

export default function LeaderReport() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentReports, setSentReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sent_reports") || "[]");
    } catch {
      return [];
    }
  });

  // Report form state
  const [form, setForm] = useState({
    actualWeight: "",
    wasteType: "Hỗn hợp",
    note: "",
    condition: "Tốt",
  });

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getCollectorTasks();
      const data = Array.isArray(res) ? res : [];
      const done = data.filter(
        (t) =>
          t.status === "Collected" ||
          t.status === "Hoàn thành" ||
          t.status === 2 ||
          t.status === "2"
      );
      setCompletedTasks(done);
    } catch (err) {
      toast.error("Không thể tải dữ liệu nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const isAlreadySent = (taskId) => sentReports.includes(String(taskId));

  const openReport = (task) => {
    setSelectedTask(task);
    setForm({ actualWeight: "", wasteType: "Hỗn hợp", note: "", condition: "Tốt" });
  };

  const handleSubmitReport = async () => {
    if (!form.actualWeight || isNaN(Number(form.actualWeight))) {
      return toast.error("Vui lòng nhập khối lượng rác thực tế hợp lệ");
    }
    setSubmitting(true);
    try {
      // TODO: Replace with real API call to submit report to Admin
      // await submitLeaderReport({ reportId: selectedTask.id, ...form });
      await new Promise((r) => setTimeout(r, 1200)); // Simulate API

      const updated = [...sentReports, String(selectedTask.id)];
      setSentReports(updated);
      localStorage.setItem("sent_reports", JSON.stringify(updated));

      toast.success("Báo cáo đã được gửi đến Admin thành công!");
      setSelectedTask(null);
    } catch {
      toast.error("Lỗi khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Báo cáo nhiệm vụ
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
            Gửi báo cáo hoàn thành •{" "}
            <span className="text-emerald-600">
              {completedTasks.length} nhiệm vụ chờ báo cáo
            </span>
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
          <FileText className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* INSTRUCTIONS BANNER */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-black text-blue-800 mb-1">Hướng dẫn báo cáo</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Chọn một nhiệm vụ đã hoàn thành bên dưới để điền và gửi báo cáo chi tiết lên Admin.
            Mỗi nhiệm vụ chỉ được gửi báo cáo <strong>một lần</strong>. Hãy kiểm tra kỹ thông tin trước khi gửi.
          </p>
        </div>
      </div>

      {/* TASK LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100" />
          ))}
        </div>
      ) : completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            Chưa có nhiệm vụ hoàn thành
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Khi có nhiệm vụ hoàn thành, bạn có thể gửi báo cáo tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {completedTasks.map((task) => {
            const sent = isAlreadySent(task.id);
            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl border shadow-sm transition-all duration-300 overflow-hidden flex flex-col group ${
                  sent
                    ? "border-emerald-100 opacity-75"
                    : "border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 cursor-pointer"
                }`}
                onClick={() => !sent && openReport(task)}
              >
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    {sent ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Đã báo cáo
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                        Chờ báo cáo
                      </span>
                    )}
                    <div className="text-xs font-bold text-gray-300">#{task.id}</div>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-sm font-black text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                      {task.address || "Địa chỉ không xác định"}
                    </h3>
                    {task.area && (
                      <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">
                        Khu vực {task.area}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto bg-gray-50/50 px-6 py-4 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-gray-400">{task.time || "—"}</span>
                    </div>
                    {!sent && (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Gửi báo cáo <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPORT MODAL */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !submitting && setSelectedTask(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-8 pt-8 pb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Gửi Báo Cáo</p>
                    <h2 className="text-lg font-black">Nhiệm vụ #{selectedTask.id}</h2>
                  </div>
                </div>
                <button
                  onClick={() => !submitting && setSelectedTask(null)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-emerald-200 shrink-0" />
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {selectedTask.address || "Địa chỉ không xác định"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body - Form */}
            <div className="p-8 space-y-5 overflow-y-auto max-h-[60vh]">
              {/* Actual Weight */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  Khối lượng thực tế (kg) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="VD: 12.5"
                  value={form.actualWeight}
                  onChange={(e) => setForm({ ...form, actualWeight: e.target.value })}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Waste Type */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Loại rác thu gom
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Hỗn hợp", "Hữu cơ", "Giấy", "Nhựa", "Kim loại"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, wasteType: type })}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        form.wasteType === type
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100"
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Tình trạng điểm thu gom
                </label>
                <div className="flex gap-2">
                  {["Tốt", "Bình thường", "Kém"].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setForm({ ...form, condition: cond })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${
                        form.condition === cond
                          ? cond === "Tốt"
                            ? "bg-green-600 text-white border-green-600"
                            : cond === "Bình thường"
                            ? "bg-yellow-500 text-white border-yellow-500"
                            : "bg-red-500 text-white border-red-500"
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  <StickyNote className="w-3.5 h-3.5 text-emerald-500" />
                  Ghi chú thêm
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả thêm tình hình thực tế, vấn đề phát sinh..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => !submitting && setSelectedTask(null)}
                disabled={submitting}
                className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={submitting || !form.actualWeight}
                className="flex-2 flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Gửi báo cáo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
