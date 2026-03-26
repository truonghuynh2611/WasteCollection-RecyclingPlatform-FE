import {
  Bell, Filter, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, UserCheck, MapPin, Calendar, Tag, User, Camera, Recycle, Eye, Users
} from "lucide-react";
// Nhập các React hook
import { useState, useEffect } from "react";
// Nhập hook useLocation để theo dõi các tham số trên URL (ví dụ: ?reportId=...)
import { useLocation } from "react-router-dom";
// Nhập Sidebar dành riêng cho Admin và Manager
import Sidebar from "../Layouts/Sidebar";
import ManagerSidebar from "../Manager/ManagerSidebar";
// Nhập context xác thực để kiểm tra vai trò người dùng
import { useAuth } from "../../contexts/AuthContext";
// Nhập hàm gọi API lấy danh sách báo cáo rác
import { getWasteReports } from "../../api/waste";
import { getAllTeams, assignReportToTeam } from "../../api/team";
// Thành phần hiển thị thông báo nhẹ (Toast)
import Toast from "../common/Toast";

// ĐỊNH NGHĨA CÁC TAB LỌC TRẠNG THÁI
const tabs = [
  { id: "all", label: "Tất cả", count: null },
  { id: "pending", label: "Chờ xử lý", count: null },
  { id: "assigned", label: "Đã phân công", count: null },
  { id: "collecting", label: "Đang thu gom", count: null },
  { id: "completed", label: "Đã hoàn thành", count: null },
];

// MÀU SẮC TƯƠNG ỨNG VỚI TỪNG TRẠNG THÁI (DÙNG CHO LABEL)
const statusColors = {
  "Pending": "bg-yellow-100 text-yellow-700",
  "Accepted": "bg-blue-100 text-blue-700",
  "Assigned": "bg-indigo-100 text-indigo-700",
  "OnTheWay": "bg-purple-100 text-purple-700",
  "Collected": "bg-green-100 text-green-700",
  "Failed": "bg-red-100 text-red-700",
};

// NHÃN TIẾNG VIỆT CHO CÁC TRẠNG THÁI TỪ BACKEND
const statusLabels = {
  "Pending": "Đang chờ",
  "Accepted": "Chấp nhận",
  "Assigned": "Đã phân công",
  "OnTheWay": "Đang đến",
  "Collected": "Hoàn thành",
  "Failed": "Đã hủy",
};

/**
 * MODAL XEM CHI TIẾT BÁO CÁO (VIEW MODAL)
 */
function ViewModal({ item, onClose }) {
  if (!item) return null;
  
  // Strip /api from the URL to get the root server URL for static files
  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:61436").replace('/api', '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center font-bold text-xl text-blue-600 shadow-sm shadow-blue-100">
              {item.citizen?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">{item.citizen?.fullName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">#REQ-{item.reportId}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-gray-500 text-sm">{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột trái: Thông tin chính */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trạng thái</p>
                <div className="flex">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Khu vực</p>
                <div className="flex items-center space-x-2 text-gray-700 font-medium">
                  <MapPin size={16} className="text-red-500" />
                  <span className="text-sm">{item.area?.name || "Tất cả khu vực"}</span>
                </div>
              </div>
            </div>

            {/* Cột phải: Danh sách mục rác chi tiết */}
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                Chi tiết báo cáo ({item.wasteReportItems?.length || 0})
              </p>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {item.wasteReportItems && item.wasteReportItems.length > 0 ? (
                  item.wasteReportItems.map((sub, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50 hover:bg-gray-100/50 transition-colors">
                      <div className="flex space-x-4">
                        <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                          {sub.imageUrl ? (
                            <img 
                              src={sub.imageUrl.startsWith('http') ? sub.imageUrl : `${API_BASE_URL}${sub.imageUrl}`} 
                              alt={sub.wasteType} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                              <Camera size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              {sub.wasteType}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                            {sub.description || "Không có mô tả chi tiết"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Legacy view for old reports */
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 italic text-gray-500 text-sm">
                    <div className="flex items-center space-x-3 mb-4">
                       <Tag className="text-purple-500" size={18} />
                       <span className="font-bold text-gray-700 not-italic">{item.wasteType}</span>
                    </div>
                    <p className="pl-7">{item.description}</p>
                    
                    {item.reportImages && item.reportImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                         {item.reportImages.map((img, i) => (
                           <img key={i} src={img.imageUrl.startsWith('http') ? img.imageUrl : `${API_BASE_URL}${img.imageUrl}`} className="w-full h-24 object-cover rounded-xl" />
                         ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MODAL PHÂN CÔNG ĐỘI THU GOM (ASSIGN MODAL)
 */
function AssignModal({ item, teams, onClose, onAssign }) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  // Lọc lấy các đội thuộc cùng một khu vực (AreaId) như báo cáo rác
  const availableTeams = teams.filter(t => t.areaId === item.areaId);

  const handleSubmit = async () => {
    if (!selectedTeam) return;
    setIsSubmitting(true);
    await onAssign(selectedTeam, item.reportId);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Phân công cho đội</h3>
              <p className="text-sm text-gray-500">Báo cáo mã #REQ-{item.reportId} tại {item.area?.name}</p>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Chọn đội thu gom khu vực này:</label>
            {availableTeams.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {availableTeams.map(t => {
                  const isFull = t.currentTaskCount >= 20;
                  return (
                    <label 
                      key={t.teamId} 
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedTeam === t.teamId ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'} ${isFull ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="teamSelection" 
                          value={t.teamId} 
                          checked={selectedTeam === t.teamId}
                          onChange={() => !isFull && setSelectedTeam(t.teamId)}
                          disabled={isFull}
                          className="w-5 h-5 text-emerald-500 border-gray-300 focus:ring-emerald-500 disabled:opacity-50"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{t.name}</p>
                          <p className="text-xs text-gray-500">Gồm {t.collectors?.length || 0} thành viên</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isFull ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {t.currentTaskCount} / 20 đơn
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 text-sm flex items-center gap-2">
                Không có đội nào phụ trách khu vực này. Vui lòng tạo thêm đội ở Quản lý Đội thu gom.
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Hủy
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={!selectedTeam || isSubmitting}
              className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {isSubmitting ? "Đang gán..." : "Xác nhận gán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENT CHÍNH: QUẢN LÝ BÁO CÁO (REPORT MANAGEMENT)
 */
export default function ReportManagement() {
  const { isManager } = useAuth();
  const location = useLocation();
  // Chọn Sidebar phù hợp dựa trên quyền (Manager hoặc Admin)
  const CurrentSidebar = isManager() ? ManagerSidebar : Sidebar;

  // TRẠNG THÁI LOCAL
  const [activeTab, setActiveTab] = useState("all"); // Tab trạng thái đang chọn
  const [data, setData] = useState([]); // Danh sách báo cáo lấy từ API
  const [teams, setTeams] = useState([]); // Danh sách các đội
  const [loading, setLoading] = useState(true); // Đang tải dữ liệu?
  const [viewItem, setViewItem] = useState(null); // Báo cáo đang được chọn để xem chi tiết
  const [assignItem, setAssignItem] = useState(null); // Báo cáo đang được chọn để phân công
  
  // Quản lý thông báo nổi (Toast)
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // FETCH DỮ LIỆU TỪ API KHI TRANG LOAD
  useEffect(() => {
    fetchReports();
    fetchTeams();
  }, [location.search]);

  const fetchTeams = async () => {
    try {
      const res = await getAllTeams();
      if (res.success) setTeams(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getWasteReports();
        
        // CHUẨN HÓA DỮ LIỆU (NORMALIZATION)
        // Ánh xạ các mã trạng thái số từ DB sang chuỗi văn bản tương ứng
        const normalizedData = (Array.isArray(response) ? response : []).map(r => {
          // Lấy giá trị status gốc, ưu tiên lowercase 'status' hoặc 'Status' từ API
          let rawStatus = r.status !== undefined ? r.status : r.Status;
          let strStatus = String(rawStatus !== undefined ? rawStatus : "");
          
          // Chuyển đổi mã trạng thái số sang chuỗi văn bản tương ứng
          if (strStatus === "0") strStatus = "Pending";
          else if (strStatus === "1") strStatus = "Accepted";
          else if (strStatus === "2") strStatus = "Assigned";
          else if (strStatus === "3") strStatus = "OnTheWay";
          else if (strStatus === "4") strStatus = "Collected";
          else if (strStatus === "5") strStatus = "Failed";
          
          return { 
            ...r, 
            status: strStatus,
            reportId: r.reportId || r.ReportId,
            description: r.description || r.Description,
            wasteType: r.wasteType || r.WasteType,
            createdAt: r.createdAt || r.CreatedAt
          };
        });
        
        setData(normalizedData);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        showToast("Không thể tải danh sách báo cáo", "error");
        setData([]);
      } finally {
        setLoading(false);
      }
  };

  // TỰ ĐỘNG MỞ CHI TIẾT NẾU URL CÓ ?reportId=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportId = params.get("reportId");
    if (reportId && data.length > 0) {
      const item = data.find(r => String(r.reportId) === reportId);
      if (item) setViewItem(item);
    }
  }, [location.search, data]);

  // LỌC DỮ LIỆU HIỂN THỊ DỰA TRÊN TAB ĐANG CHỌN
  const filteredData = data.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return item.status === "Pending";
    if (activeTab === "assigned") return item.status === "Assigned" || item.status === "Accepted";
    if (activeTab === "collecting") return item.status === "OnTheWay";
    if (activeTab === "completed") return item.status === "Collected";
    return true;
  });

  const handleAssignSubmit = async (teamId, reportId) => {
    try {
      const res = await assignReportToTeam({ teamId, reportId });
      if (res.success) {
        showToast("Phân công đội thành công", "success");
        setAssignItem(null);
        fetchReports(); // Làm mới lại danh sách báo cáo
        fetchTeams(); // Cập nhật lại số lượng task count của Teams
      } else {
        showToast(res.message || "Gán thất bại", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi khi gán đội", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR TƯƠNG ỨNG VỚI ROLE */}
      <CurrentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* THANH ĐIỀU HƯỚNG TRÊN (TOP NAVIGATION) */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý báo cáo</h1>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* THANH CÔNG CỤ: TABS VÀ FILTER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Lọc kết quả
            </button>
          </div>

          {/* BẢNG DANH SÁCH BÁO CÁO (REPORTS TABLE) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Người báo cáo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Loại rác & Vị trí</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-20 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Không tìm thấy báo cáo nào</td>
                  </tr>
                ) : (
                  filteredData.map((req) => (
                    <tr key={req.reportId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                            {req.citizen?.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{req.citizen?.fullName}</p>
                            <p className="text-xs text-gray-400">#REQ-{req.reportId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">{req.wasteType}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">{req.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || "bg-gray-100 text-gray-700"}`}>
                          {statusLabels[req.status] || req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setViewItem(req)}
                            title="Xem chi tiết"
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === "Pending" && (
                            <button 
                              onClick={() => setAssignItem(req)}
                              title="Phân công đội"
                              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* HIỂN THỊ MODAL KHI CÓ ITEM ĐƯỢC CHỌN */}
      <ViewModal 
        item={viewItem} 
        onClose={() => setViewItem(null)} 
      />

      <AssignModal 
        item={assignItem}
        teams={teams}
        onClose={() => setAssignItem(null)}
        onAssign={handleAssignSubmit}
      />
      
      {/* THÔNG BÁO NỔI (TOAST) Tự định nghĩa */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
