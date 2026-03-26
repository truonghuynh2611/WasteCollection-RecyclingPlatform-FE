import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { processWasteReport } from "../../api/waste";
import { getLeaderTeamReports, updateReportByLeader, deleteReportByLeader } from "../../api/collector";
import {
  FileText, Send, CheckCircle2, MapPin, Clock,
  Scale, StickyNote, ChevronRight, X, AlertTriangle,
  History, PlusCircle, Edit, Trash2, Loader2, AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

const statusMapping = {
  "Pending": { label: "Đang chờ", color: "bg-gray-100 text-gray-500 border-gray-200" },
  "Accepted": { label: "Đã chấp nhận", color: "bg-blue-50 text-blue-500 border-blue-100" },
  "Assigned": { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  "OnTheWay": { label: "Đang thu gom", color: "bg-blue-100 text-blue-600 border-blue-200" },
  "ReportedByTeam": { label: "Chờ Admin duyệt", color: "bg-orange-100 text-orange-600 border-orange-200" },
  "Collected": { label: "Đã hoàn tất", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  "Failed": { label: "Đã hủy", color: "bg-red-100 text-red-600 border-red-200" },
};

export default function LeaderReport() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new"); // "new" | "history"
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [processForm, setProcessForm] = useState({
    isValid: true,
    collectorImageUrl: "",
  });

  const [editForm, setEditForm] = useState({
    description: "",
    wasteType: "",
    areaId: ""
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getLeaderTeamReports();
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách báo cáo của đội");
    } finally {
      setLoading(false);
    }
  };

  // Logic phân loại task
  const newTasks = reports.filter(r => ["Assigned", "OnTheWay", "Accepted", "Pending"].includes(r.status));
  const historyTasks = reports.filter(r => ["Collected", "Failed", "ReportedByTeam"].includes(r.status));

  // --- ACTIONS ---

  const handleProcess = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const payload = {
        reportId: selectedTask.reportId,
        collectorId: user.collectorId,
        isValid: processForm.isValid,
        collectorImageUrl: null // Skip placeholder to avoid BE validation for now
      };
      const res = await processWasteReport(payload);
      if (res) {
        toast.success("Đã báo cáo hoàn thành thành công!");
        setSelectedTask(null);
        fetchReports();
      }
    } catch (err) {
      toast.error("Lỗi khi báo cáo hoàn thành.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTask) return;
    setSubmitting(true);
    try {
      const res = await updateReportByLeader(editingTask.reportId, editForm);
      if (res.success) {
        toast.success("Cập nhật báo cáo thành công!");
        setEditingTask(null);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo cáo này? Thao tác này sẽ gỡ nhiệm vụ khỏi database.")) return;
    try {
      const res = await deleteReportByLeader(reportId);
      if (res.success) {
        toast.success("Xóa báo cáo thành công");
        fetchReports();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditForm({
      description: task.note || "",
      wasteType: task.wasteType || "",
      areaId: task.areaId || "" // BE current DTO may need areaId
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Đang tải dữ liệu đội...</p>
    </div>
  );

  return (
    <div className="w-full">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Khu vực Leader</h1>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
            Quản lý báo cáo công việc của đội
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "new" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-gray-400 hover:text-emerald-600"
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Nhiệm vụ mới ({newTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "history" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-gray-400 hover:text-emerald-600"
            }`}
          >
            <History className="w-4 h-4" /> Lịch sử & Quản lý
          </button>
        </div>
      </div>

      {activeTab === "new" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {newTasks.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chưa có nhiệm vụ mới được gán</p>
            </div>
          ) : (
            newTasks.map(task => (
              <TaskCard 
                key={task.reportId} 
                task={task} 
                onProcess={() => setSelectedTask(task)}
                onEdit={() => openEditModal(task)}
                onDelete={() => handleDelete(task.reportId)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Báo cáo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại rác</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày gán</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyTasks.map(task => (
                <tr key={task.reportId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">#REQ-{task.reportId}</span>
                      <span className="text-[10px] text-gray-500 leading-tight line-clamp-1">{task.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 text-sm">{task.wasteType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${statusMapping[task.status]?.color || "bg-gray-100 text-gray-400"}`}>
                      {statusMapping[task.status]?.label || task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       {task.status === "Pending" && (
                         <>
                           <button onClick={() => openEditModal(task)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Sửa">
                             <Edit className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(task.reportId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {historyTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Lịch sử trống</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PROCESS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setSelectedTask(null)}>
          <div className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-emerald-600 p-8 text-white">
              <h2 className="text-xl font-black uppercase">Báo cáo hoàn thành</h2>
              <p className="text-emerald-100 text-xs mt-1">#REQ-{selectedTask.reportId} • {selectedTask.address}</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Tình trạng thực tế</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setProcessForm({...processForm, isValid: true})} className={`py-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${processForm.isValid ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-100 text-gray-400"}`}>
                    Hợp lệ
                  </button>
                  <button onClick={() => setProcessForm({...processForm, isValid: false})} className={`py-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${!processForm.isValid ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-100 text-gray-400"}`}>
                    Không hợp lệ
                  </button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">Lưu ý: Sau khi xác nhận hoàn thành, báo cáo sẽ được chuyển trạng thái sang "Hoàn thành" (hoặc chờ xác nhận tùy BE) và hệ thống sẽ tích điểm cho khách hàng.</p>
              </div>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button disabled={submitting} onClick={() => setSelectedTask(null)} className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[10px] uppercase">Hủy</button>
              <button disabled={submitting} onClick={handleProcess} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận gửi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setEditingTask(null)}>
          <div className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-gray-100">
               <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Cập nhật báo cáo</h2>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Loại rác</label>
                <input value={editForm.wasteType} onChange={e => setEditForm({...editForm, wasteType: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Mô tả chi tiết</label>
                <textarea rows={4} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setEditingTask(null)} className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[10px] uppercase">Bỏ qua</button>
              <button onClick={handleUpdate} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onProcess, onEdit, onDelete }) {
  const status = statusMapping[task.status] || { label: task.status, color: "bg-gray-100" };
  const canModify = task.status === "Pending";

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
            {status.label}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canModify && (
              <>
                <button onClick={onEdit} className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all" title="Sửa"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={onDelete} className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 rounded-xl transition-all" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-black text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">#{task.reportId} - {task.address || "Địa chỉ thu gom"}</h3>
          <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-2">{task.wasteType}</p>
        </div>
      </div>
      <div className="mt-auto bg-gray-50/50 p-6 pt-4 border-t border-gray-50 flex flex-col gap-4">
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500" /> 08:30</div>
          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {task.district || "Quận"}</div>
        </div>
        <button 
          onClick={onProcess}
          className="w-full py-3.5 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
        >
          Báo cáo hoàn thành <ChevronRight className="w-4 h-4 inline-block ml-1" />
        </button>
      </div>
    </div>
  );
}
