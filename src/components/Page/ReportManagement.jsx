// Nhập các icon cần thiết từ lucide-react để minh họa trạng thái và thao tác
import {
  Bell, Filter, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, UserCheck, MapPin, Calendar, Tag, User
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
function ViewModal({ item, statusColors, statusLabels, onClose, onEdit }) {
  if (!item) return null;
  
  // Lấy URL cấu hình từ biến môi trường để hiển thị ảnh
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Phần đầu Modal: Avatar người báo cáo và mã yêu cầu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg bg-blue-100 text-blue-600`}>
              {item.citizen?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{item.citizen?.fullName}</h3>
              <p className="text-xs text-gray-400">#REQ-{item.reportId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Trạng thái hiện tại của báo cáo */}
        <div className="flex justify-center mb-5">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
            {statusLabels[item.status] || item.status}
          </span>
        </div>

        {/* Khu vực hiển thị ảnh đính kèm (nếu có) */}
        {item.reportImages && item.reportImages.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase">Hình ảnh đính kèm</p>
            <div className="grid grid-cols-2 gap-2">
              {item.reportImages.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img.imageUrl.startsWith('http') ? img.imageUrl : `${API_BASE_URL}${img.imageUrl}`} 
                  alt="Waste" 
                  className="w-full h-32 object-cover rounded-xl border border-gray-100"
                />
              ))}
            </div>
          </div>
        )}

        {/* Thông tin chi tiết: Loại rác, Vị trí, Thời gian */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <Tag className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Loại rác</p>
              <p className="text-sm font-semibold text-gray-700">{item.wasteType}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Vị trí báo cáo</p>
              <p className="text-sm font-semibold text-gray-700">{item.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Thời gian</p>
              <p className="text-sm font-semibold text-gray-700">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
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

  // FETCH DỮ LIỆU TỪ API KHI TRANG LOAD
  useEffect(() => {
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
    fetchReports();
  }, [location.search]);

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
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
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
