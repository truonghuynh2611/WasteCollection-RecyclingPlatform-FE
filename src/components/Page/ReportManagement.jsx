// Nhập các icon cần thiết từ lucide-react để minh họa trạng thái và thao tác
import {
  Bell, Filter, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, UserCheck, MapPin, Calendar, Tag, User, Users, Camera, Recycle, Eye
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
import { getWasteReports, assignReport, verifyCompletion, rejectReport } from "../../api/waste";
// Thành phần hiển thị thông báo nhẹ (Toast)
import Toast from "../common/Toast";

// ĐỊNH NGHĨA CÁC TAB LỌC TRẠNG THÁI
const tabs = [
  { id: "all", label: "Tất cả", count: null },
  { id: "pending", label: "Chờ xử lý", count: null },
  { id: "assigned", label: "Đã phân công", count: null },
  { id: "collecting", label: "Đang thu gom", count: null },
  { id: "reported", label: "Chờ xác nhận", count: null },
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
  "ReportedByTeam": "bg-blue-100 text-blue-700",
};

// NHÃN TIẾNG VIỆT CHO CÁC TRẠNG THÁI TỪ BACKEND
const statusLabels = {
  "Pending": "Đang chờ",
  "Accepted": "Chấp nhận",
  "Assigned": "Đã phân công",
  "OnTheWay": "Đang đến",
  "Collected": "Hoàn thành",
  "Failed": "Đã hủy",
  "ReportedByTeam": "Chờ xác nhận",
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
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
              {(item.citizen?.user?.fullName || item.citizen?.fullName || "U").charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {item.citizen?.user?.fullName || item.citizen?.fullName || "Người dùng ẩn danh"}
              </h3>
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

              {item.team && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Đội xử lý</p>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-indigo-500" />
                    <span className="text-sm font-bold text-gray-700">{item.team.name}</span>
                  </div>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.team.type === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.team.type === 1 ? 'Đội Phụ' : 'Đội Chính'}
                  </span>
                </div>
              )}
            </div>

            {/* Cột phải: Danh sách mục rác chi tiết */}
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                Chi tiết báo cáo ({item.wasteReportItems?.length || 0})
              </p>
              
              {(!item.wasteReportItems || item.wasteReportItems.length === 0) && (
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 flex-shrink-0">
                      <Recycle size={24} />
                    </div>
                    <div>
                      <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                        {item.wasteType || "Loại rác chung"}
                      </span>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item.description || "Không có mô tả chi tiết"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {item.wasteReportItems && item.wasteReportItems.length > 0 && 
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
                }
              </div>

              {item.reportImages && item.reportImages.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                    Hình ảnh minh chứng
                  </p>
                  
                  {item.collectorNote && (
                    <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Ghi chú từ đội thu gom</p>
                      <p className="text-sm text-indigo-700 italic">"{item.collectorNote}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {item.reportImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img 
                          src={img.imageurl?.startsWith('http') ? img.imageurl : `${API_BASE_URL}${img.imageurl}`} 
                          className="w-full h-24 object-cover rounded-xl border border-gray-100 shadow-sm"
                          alt="Report Image"
                        />
                        <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white ${img.imageType === 'Collector' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                          {img.imageType === 'Collector' ? 'Đội thu gom' : 'Người dân'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
  const [loading, setLoading] = useState(true); // Đang tải dữ liệu?
  const [viewItem, setViewItem] = useState(null); // Báo cáo đang được chọn để xem chi tiết
  
  // Quản lý thông báo nổi (Toast)
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getWasteReports();
      
      const normalizedData = (Array.isArray(response) ? response : []).map(r => {
        let rawStatus = r.status !== undefined ? r.status : r.Status;
        let strStatus = String(rawStatus !== undefined ? rawStatus : "");
        
        if (strStatus === "0") strStatus = "Pending";
        else if (strStatus === "1") strStatus = "Accepted";
        else if (strStatus === "2") strStatus = "Assigned";
        else if (strStatus === "3") strStatus = "OnTheWay";
        else if (strStatus === "4") strStatus = "Collected";
        else if (strStatus === "5") strStatus = "Failed";
        else if (strStatus === "6") strStatus = "ReportedByTeam";
        
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

  const handleApprove = async (reportId) => {
    try {
      const res = await assignReport(reportId);
      if (res.success || res === "Report approved and assigned to Main Team successfully") {
        showToast("Đã duyệt và gán cho Đội Chính");
        fetchReports();
      } else {
        showToast(res.message || "Lỗi khi duyệt báo cáo", "error");
      }
    } catch (error) {
      showToast(error.response?.data || error.message || "Lỗi khi duyệt", "error");
    }
  };

  const handleVerify = async (reportId, isApproved) => {
    try {
      const adminNote = isApproved ? "Verified by Admin" : window.prompt("Nhập lý do từ chối bằng chứng:", "Bằng chứng không rõ ràng");
      if (!isApproved && adminNote === null) return; // Hủy nếu nhấn Cancel ở prompt

      const res = await verifyCompletion({ reportId, isApproved, adminNote: adminNote || "Rejected by Admin" });
      if (res.success || res === "Report finalized and points awarded" || res === "Report rejected and returned to team") {
        showToast(isApproved ? "Đã xác nhận hoàn thành" : "Đã từ chối bằng chứng");
        fetchReports();
      } else {
        showToast(res.message || "Lỗi khi xử lý", "error");
      }
    } catch (error) {
      showToast(error.response?.data || error.message || "Lỗi khi xử lý", "error");
    }
  };

  const handleRejectPending = async (reportId) => {
    try {
      const reason = window.prompt("Nhập lý do từ chối báo cáo này:", "Thông tin rác không chính xác");
      if (reason === null) return; // Hủy nếu nhấn Cancel

      const res = await rejectReport(reportId, reason || "Từ chối bởi Admin");
      if (res.success || res.data) {
        showToast("Đã từ chối báo cáo");
        fetchReports();
      } else {
        showToast(res.message || "Lỗi khi từ chối", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || error.message || "Lỗi khi từ chối", "error");
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

  useEffect(() => {
    fetchReports();
  }, [location.search]);

  // LỌC DỮ LIỆU HIỂN THỊ DỰA TRÊN TAB ĐANG CHỌN
  const filteredData = data.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return item.status === "Pending";
    if (activeTab === "assigned") return item.status === "Assigned" || item.status === "Accepted";
    if (activeTab === "collecting") return item.status === "OnTheWay";
    if (activeTab === "reported") return item.status === "ReportedByTeam";
    if (activeTab === "completed") return item.status === "Collected";
    return true;
  });

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
                            className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                           {req.status === "Pending" && (
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => handleApprove(req.reportId)}
                                 className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                               >
                                 Duyệt
                               </button>
                               <button 
                                 onClick={() => handleRejectPending(req.reportId)}
                                 className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                               >
                                 Từ chối
                               </button>
                             </div>
                           )}
                           {req.status === "ReportedByTeam" && (
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => handleVerify(req.reportId, true)}
                                 className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                               >
                                 Xác nhận
                               </button>
                               <button 
                                 onClick={() => handleVerify(req.reportId, false)}
                                 className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors"
                               >
                                 Từ chối
                               </button>
                             </div>
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
        statusColors={statusColors} 
        statusLabels={statusLabels} 
        onClose={() => setViewItem(null)} 
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
