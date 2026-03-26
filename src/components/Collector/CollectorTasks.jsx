import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Clock, X, ChevronRight, Scale, Info, ClipboardList, Recycle, Camera } from "lucide-react";
import { taskService } from "../../api/task";
import { confirmWasteReport, processWasteReport } from "../../api/waste";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

/**
 * COMPONENT QUẢN LÝ DANH SÁCH NHIỆM VỤ CỦA COLLECTOR
 */
export default function CollectorTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);           // Toàn bộ danh sách nhiệm vụ
  const [loading, setLoading] = useState(true);     // Trạng thái đang tải dữ liệu
  const [activeTab, setActiveTab] = useState("Tất cả"); // Tab lọc trạng thái hiện tại
  const [searchQuery, setSearchQuery] = useState(""); // Nội dung tìm kiếm theo địa chỉ
  const [selectedTask, setSelectedTask] = useState(null); // Nhiệm vụ đang được xem chi tiết
  
  // States for Leader reporting
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * EFFECT: Tải dữ liệu nhiệm vụ khi component mount
   */
  useEffect(() => {
    fetchTasks();
  }, []);

  /**
   * HÀM TẢI DANH SÁCH NHIỆM VỤ TỪ API
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getCollectorTasks();
      
      // BE now returns real strings like "Assigned", "OnTheWay", etc.
      // But we might also receive numeric codes from some endpoints.
      const normalizedData = (Array.isArray(res) ? res : []).map(t => {
        let s = t.status;
        if (s === 0 || s === "0") s = "Pending";
        else if (s === 1 || s === "1") s = "Accepted";
        else if (s === 2 || s === "2") s = "Assigned";
        else if (s === 3 || s === "3") s = "OnTheWay";
        else if (s === 4 || s === "4") s = "Collected";
        return { ...t, status: s };
      });
      setTasks(normalizedData);
    } catch (err) {
      console.error("Lỗi khi tải nhiệm vụ:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CẬP NHẬT TRẠNG THÁI NHIỆM VỤ (Ví dụ: Chờ -> Đang thu gom -> Hoàn thành)
   */
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await taskService.updateTaskStatus(id, newStatus);
      // Cập nhật lại state cục bộ để UI đồng bộ ngay lập tức
      setTasks(tasks.map(t => t.reportId === id ? { ...t, status: newStatus } : t));
      if (selectedTask?.reportId === id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      toast.error("Cập nhật trạng thái thất bại.");
    }
  };

  const handleAcceptTask = async (reportId) => {
    try {
      const res = await confirmWasteReport(reportId);
      if (res) {
        toast.success("Đã xác nhận nhận nhiệm vụ thành công!");
        fetchTasks();
        if (selectedTask?.reportId === reportId) {
          setSelectedTask({ ...selectedTask, status: "OnTheWay" });
        }
      }
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || "Lỗi khi xác nhận nhiệm vụ";
      toast.error(errorMsg);
    }
  };

  const handleSubmitCompletion = async (reportId) => {
    setIsSubmitting(true);
    try {
      const res = await processWasteReport({
        reportId,
        isValid: true,
        collectorImageUrl: "" // No longer required as per user request
      });
      
      if (res) {
        toast.success("Nhiệm vụ đã hoàn tất thành công! Điểm đã được cộng cho công dân.");
        setEvidenceUrl("");
        fetchTasks();
        setSelectedTask(null); // Close modal on success
      }
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || "Lỗi khi gửi báo cáo";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * LOGIC LỌC VÀ TÌM KIẾM NHIỆM VỤ
   */
  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === "Tất cả" || t.status === activeTab;
    const matchesSearch = t.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statusMapping = {
    "Pending": { label: "Đang chờ", color: "bg-gray-100 text-gray-400 border-gray-200" },
    "Assigned": { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-600 border-yellow-200" },
    "OnTheWay": { label: "Đang thu gom", color: "bg-blue-100 text-blue-600 border-blue-200" },
    "Collected": { label: "Đã hoàn tất", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
    "ReportedByTeam": { label: "Chờ Admin duyệt", color: "bg-orange-100 text-orange-600 border-orange-200" },
    "Accepted": { label: "Đã chấp nhận", color: "bg-blue-50 text-blue-500 border-blue-100" }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER TRANG NHIỆM VỤ (Tiêu đề nội bộ) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Danh sách nhiệm vụ</h1>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
            Hôm nay: <span className="text-emerald-600">6/3/2026</span> • {filteredTasks.length} nhiệm vụ phù hợp
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
           <Filter className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      <div className="p-0">
          
          {/* THANH TÌM KIẾM VÀ TABS LỌC THEO TRẠNG THÁI */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto overflow-x-auto">
              {["Tất cả", "Chờ", "Đang thu gom", "Hoàn thành"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                      : "text-gray-400 hover:text-emerald-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm theo địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* HIỂN THỊ KẾT QUẢ DANH SÁCH NHIỆM VỤ */}
          {loading ? (
            // Hiển thị khung giả (skeleton) khi đang tải dữ liệu
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-white rounded-3xl border border-gray-100" />)}
            </div>
          ) : filteredTasks.length > 0 ? (
            // Danh sách các Card nhiệm vụ khi đã tải xong
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map(task => (
                <div 
                  key={task.reportId} 
                  className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusMapping[task.status]?.color || "bg-gray-100 text-gray-500"}`}>
                        {statusMapping[task.status]?.label || task.status}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-black text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">{task.address}</h3>
                      <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">Khu vực {task.area}</p>
                    </div>
                  </div>

                  <div className="mt-auto bg-gray-50/50 p-6 pt-4 border-t border-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-500 uppercase tracking-tight mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>{new Date(task.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-500" />
                        <span>{task.wasteType || "Rác thải"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group/btn">
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">Nhấn để xem chi tiết</span>
                       <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover/btn:bg-emerald-600 group-hover/btn:text-white transition-all transform group-hover:translate-x-1">
                          <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Giao diện khi không tìm thấy kết quả phù hợp
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Không tìm thấy nhiệm vụ</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium">Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
      </div>

      {/* MODAL HIỂN THỊ CHI TIẾT NHIỆM VỤ (Task Detail Modal) */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedTask(null)}>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              {/* Header Modal */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-100">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Chi tiết nhiệm vụ</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Thông tin chính của nhiệm vụ */}
              <div className="space-y-6 mb-8">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Địa chỉ thu gom</p>
                  <p className="text-xl font-bold text-gray-800 leading-tight">{selectedTask.address}</p>
                </div>

                {/* Các chỉ số phụ dạng Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Trạng thái",  value: statusMapping[selectedTask.status]?.label || selectedTask.status, icon: Info,  color: statusMapping[selectedTask.status]?.color || "bg-gray-50 text-gray-400" },
                    { label: "Giờ thu gom", value: new Date(selectedTask.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }), icon: Clock, color: "text-blue-600 bg-blue-50" },
                    { label: "Loại rác",    value: selectedTask.wasteType || "Rác thải", icon: Scale, color: "text-purple-600 bg-purple-50" },
                    { label: "Mã báo cáo",  value: `#${selectedTask.reportId}`, icon: Info,  color: "text-gray-600 bg-gray-50" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-50 shrink-0">
                        <item.icon className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{item.label}</p>
                        <p className={`text-xs font-bold truncate ${item.color.split(' ')[0]}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NÚT THAO TÁC THEO TRẠNG THÁI */}
               <div className="flex flex-col gap-3">
                {selectedTask.status === "Assigned" && (
                  <button
                    onClick={() => handleAcceptTask(selectedTask.reportId)}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Xác nhận nhận việc
                  </button>
                )}
                 {selectedTask.status === "OnTheWay" && (
                  <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100">
                    {user?.collectorRole === "Leader" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Camera className="w-5 h-5 text-blue-600" />
                           </div>
                           <p className="text-blue-700 font-black uppercase tracking-widest text-[10px]">Báo cáo hoàn thành (Leader)</p>
                        </div>
                        
                        <button
                          onClick={() => handleSubmitCompletion(selectedTask.reportId)}
                          disabled={isSubmitting}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
                        >
                          {isSubmitting ? "Đang xử lý..." : "Xác nhận hoàn tất nhiệm vụ"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                        <p className="text-blue-600 text-xs font-black text-center uppercase tracking-widest leading-relaxed">
                          Bạn đang thực hiện nhiệm vụ này.<br/>
                          <span className="text-[10px] lowercase font-bold opacity-70 italic">(Vui lòng dùng chức năng Báo cáo của Leader để hoàn tất)</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {selectedTask.status === "ReportedByTeam" && (
                   <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Info className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-orange-600 text-xs font-black text-center uppercase tracking-widest leading-relaxed">
                      Đã gửi báo cáo.<br/>
                      <span className="text-[10px] lowercase font-bold opacity-70 italic">(Đang chờ Admin phê duyệt để hoàn tất)</span>
                    </p>
                  </div>
                )}
                {selectedTask.status === "Collected" && (
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Recycle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-emerald-600 text-xs font-black text-center uppercase tracking-widest leading-relaxed">
                      Nhiệm vụ đã hoàn tất thành công!
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-5 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
