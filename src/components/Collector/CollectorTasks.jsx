// Nhập các hook từ React
import { useState, useEffect } from "react";
// Nhập các icon minh họa từ thư viện lucide-react
import { Search, Filter, MapPin, Clock, X, ChevronRight, Scale, Info, ClipboardList } from "lucide-react";
// Nhập API service để lấy và cập nhật dữ liệu nhiệm vụ
import { taskService } from "../../api/task";
import { getProfile } from "../../api/collector";
import { submitCompletion } from "../../api/waste";
import { default as Toast } from "../common/Toast";
import { Camera, Trash2 } from "lucide-react";

/**
 * COMPONENT QUẢN LÝ DANH SÁCH NHIỆM VỤ CỦA COLLECTOR
 */
export default function CollectorTasks() {
  // States quản lý dữ liệu và trạng thái UI
  const [tasks, setTasks] = useState([]);           // Toàn bộ danh sách nhiệm vụ
  const [loading, setLoading] = useState(true);     // Trạng thái đang tải dữ liệu
  const [activeTab, setActiveTab] = useState("Tất cả"); // Tab lọc trạng thái hiện tại
  const [searchQuery, setSearchQuery] = useState(""); // Nội dung tìm kiếm theo địa chỉ
  const [selectedTask, setSelectedTask] = useState(null); // Nhiệm vụ đang được xem chi tiết
  const [collectorProfile, setCollectorProfile] = useState(null); // Profile của collector hiện tại
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false); // Modal nộp minh chứng
  const [evidenceImages, setEvidenceImages] = useState([]); // File ảnh minh chứng
  const [evidencePreview, setEvidencePreview] = useState([]); // Preview ảnh minh chứng
  const [completionNote, setCompletionNote] = useState(""); // Ghi chú hoàn thành
  const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi
  const [toast, setToast] = useState(null);

  /**
   * EFFECT: Tải dữ liệu nhiệm vụ khi component mount
   */
  useEffect(() => {
    fetchTasks();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setCollectorProfile(profile);
    } catch (err) {
      console.error("Lỗi khi tải profile:", err);
    }
  };

  /**
   * HÀM TẢI DANH SÁCH NHIỆM VỤ TỪ API
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getCollectorTasks();
      // Chuẩn hóa trạng thái từ số sang chữ nếu cần
      const normalizedData = (Array.isArray(res) ? res : []).map(t => {
        let s = t.status;
        if (s === "0" || s === 0) s = "Chờ";
        else if (s === "1" || s === 1) s = "Đang thu gom";
        else if (s === "2" || s === 2 || s === "Collected") s = "Hoàn thành";
        else if (s === "6" || s === 6 || s === "ReportedByTeam") s = "Đang chờ admin xác nhận";
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
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      if (selectedTask?.id === id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại.");
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

  const statusColors = {
    "Chờ": "bg-gray-100 text-gray-500 border-gray-200",
    "Đang thu gom": "bg-blue-100 text-blue-600 border-blue-200",
    "Hoàn thành": "bg-green-100 text-green-600 border-green-200",
    "Đang chờ admin xác nhận": "bg-amber-100 text-amber-600 border-amber-200",
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEvidenceImages(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvidencePreview(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
    setEvidencePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvidence = async () => {
    if (!selectedTask || !collectorProfile) return;
    if (evidenceImages.length === 0) {
      setToast({ message: "Vui lòng tải ít nhất 1 ảnh minh chứng.", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("ReportId", selectedTask.reportId || selectedTask.id);
      formData.append("LeaderId", collectorProfile.collectorId);
      formData.append("Note", completionNote);
      
      evidenceImages.forEach(file => {
        formData.append("ImageFiles", file);
      });

      await submitCompletion(formData);
      setToast({ message: "Đã gửi báo cáo hoàn thành cho Admin!", type: "success" });
      setIsEvidenceModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
      
      // Reset state
      setEvidenceImages([]);
      setEvidencePreview([]);
      setCompletionNote("");
    } catch (err) {
      console.error("Lỗi khi gửi báo cáo hoàn thành:", err);
      setToast({ message: err.response?.data || "Gửi báo cáo thất bại.", type: "error" });
    } finally {
      setSubmitting(false);
    }
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
              {["Tất cả", "Chờ", "Đang thu gom", "Đang chờ admin xác nhận", "Hoàn thành"].map(tab => (
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
                  key={task.id} 
                  className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[task.status] || "bg-gray-100 text-gray-500"}`}>
                        {task.status}
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
                        <span>{task.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-500" />
                        <span>{task.type}</span>
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
                    { label: "Trạng thái",  value: selectedTask.status, icon: Info,  color: statusColors[selectedTask.status] || "bg-gray-50 text-gray-500" },
                    { label: "Giờ thu gom", value: selectedTask.time,   icon: Clock, color: "text-blue-600 bg-blue-50" },
                    { label: "Loại rác",    value: selectedTask.type,   icon: Scale, color: "text-purple-600 bg-purple-50" },
                    { label: "Mã báo cáo",  value: `#${selectedTask.id}`, icon: Info,  color: "text-gray-600 bg-gray-50" },
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
                {selectedTask.status === "Chờ" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "Đang thu gom")}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-100 active:scale-95"
                  >
                    Bắt đầu thu gom ngay
                  </button>
                )}
                {selectedTask.status === "Đang thu gom" && (
                  collectorProfile?.role === 1 ? (
                    <button
                      onClick={() => setIsEvidenceModalOpen(true)}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-100 active:scale-95"
                    >
                      Báo cáo hoàn thành (Nộp minh chứng)
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-5 bg-gray-200 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs cursor-not-allowed"
                    >
                      Đợi Trưởng nhóm báo cáo hoàn thành
                    </button>
                  )
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

      {/* MODAL NỘP MINH CHỨNG (Leader only) */}
      {isEvidenceModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-100">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Báo cáo hoàn thành</h2>
                </div>
                <button onClick={() => setIsEvidenceModalOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Hình ảnh minh chứng ({evidenceImages.length})</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {evidencePreview.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                        <img src={url} className="w-full h-full object-cover" alt="evidence" />
                        <button 
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray-300 hover:text-blue-500 hover:border-blue-200">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter">Thêm ảnh</span>
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Ghi chú (Tùy chọn)</label>
                  <textarea 
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="Nhập ghi chú thu gom (nếu có)..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSubmitEvidence}
                  disabled={submitting || evidenceImages.length === 0}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {submitting ? "Đang xử lý..." : "Gửi minh chứng hoàn thành"}
                </button>
                <button
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="w-full py-5 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
