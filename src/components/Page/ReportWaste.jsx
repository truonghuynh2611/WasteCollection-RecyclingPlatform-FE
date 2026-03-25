// Nhập các hook quản lý trạng thái, hiệu ứng và tham chiếu từ React
import { useState, useEffect, useRef } from "react";
// Nhập các thành phần điều hướng từ thư viện React Router
import { Link, useNavigate, useLocation } from "react-router-dom";
// Nhập các biểu tượng minh họa từ lucide-react (Máy ảnh, Vị trí, Gửi, Lọc, Tái chế, Thùng rác...)
import { Camera, MapPin, Send, Filter, Recycle, ArrowRight, Trash2, Eye, X, ChevronDown, ChevronUp } from "lucide-react";
// Nhập context xác thực để lấy thông tin công dân và trạng thái đăng nhập
import { useAuth } from "../../contexts/AuthContext";
// Nhập các hàm gọi API liên quan đến báo cáo rác (Tạo mới, Lấy danh sách, Xóa)
import { createWasteReport, getWasteReportsByCitizen, deleteWasteReport, updateWasteReport } from "../../api/waste";
// Nhập các hàm gọi API lấy thông tin địa giới hành chính (Quận/Huyện, Khu vực)
import { getAllDistricts, getDistrictDetails } from "../../api/district";
// Nhập các component dùng chung (Thông báo Toast, Modal xác nhận)
import { default as Toast } from "../common/Toast";
import { default as ConfirmModal } from "../common/ConfirmModal";

// Định nghĩa các mốc phân hạng dựa trên số điểm tích lũy
const RANKS = [
  { name: "Đồng", min: 0 },
  { name: "Bạc", min: 250 },
  { name: "Vàng", min: 1000 },
  { name: "Kim cương", min: 2500 },
];

// Các loại rác hỗ trợ phân loại tại nguồn
const WASTE_TYPES = [
  { id: "Giấy", label: "Giấy", icon: "📄" },
  { id: "Nhựa", label: "Nhựa", icon: "🗑️" },
  { id: "Kim loại", label: "Kim loại", icon: "⚙️" },
];

/**
 * BẢNG ÁNH XẠ TRẠNG THÁI (STATUS MAPPING)
 * Chuyển đổi mã trạng thái hoặc tên tiếng Anh từ Backend sang tiếng Việt
 */
const STATUS_MAP = {
  // Bản đồ cho giá trị enum số từ Backend
  0: "Đang chờ",
  1: "Chấp nhận",
  2: "Đã phân công",
  3: "Đang đến",
  4: "Hoàn thành",
  5: "Đã hủy",
  
  // Bản đồ cho tên enum chuỗi (PascalCase)
  "Pending": "Đang chờ",
  "Accepted": "Chấp nhận",
  "Assigned": "Đã phân công",
  "OnTheWay": "Đang đến",
  "Collected": "Hoàn thành",
  "Failed": "Đã hủy",
};

// Định nghĩa màu sắc hiển thị tương ứng với từng trạng thái
const STATUS_COLORS = {
  "Đang chờ": "bg-amber-50 text-amber-700 border border-amber-100",
  "Chấp nhận": "bg-blue-50 text-blue-700 border border-blue-100",
  "Đã phân công": "bg-sky-50 text-sky-700 border border-sky-100",
  "Đang đến": "bg-violet-50 text-violet-700 border border-violet-100",
  "Hoàn thành": "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "Đã hủy": "bg-rose-50 text-rose-700 border border-rose-100",
};

/**
 * Hàm tính toán hạng hiện tại dựa trên số điểm
 */
function getRankFromPoints(points) {
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].min) {
      rank = RANKS[i];
      break;
    }
  }
  return rank;
}

/**
 * Hàm tính toán tiến trình nâng hạng (phần trăm và số điểm còn thiếu)
 */
function getRankProgress(userPoints) {
  const currentRank = getRankFromPoints(userPoints);
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  if (!nextRank)
    return { progress: 100, needed: 0, currentRank, nextRank: null };
  const progress =
    ((userPoints - currentRank.min) / (nextRank.min - currentRank.min)) * 100;
  const needed = nextRank.min - userPoints;
  return {
    progress: Math.min(progress, 100),
    needed: Math.max(needed, 0),
    currentRank,
    nextRank,
  };
}

// Hàm định dạng ngày tháng theo chuẩn Việt Nam
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("vi-VN");
}

// Hàm định dạng giờ phút theo chuẩn Việt Nam
function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * COMPONENT BÁO CÁO RÁC THẢI (REPORT WASTE)
 * Chức năng chính: 
 * 1. Cho phép công dân gửi báo cáo rác thải kèm hình ảnh, vị trí, chủng loại.
 * 2. Hiển thị thông tin tích điểm, thứ hạng của người dùng.
 * 3. Hiển thị lịch sử các báo cáo đã gửi và trạng thái xử lý.
 */
function ReportWaste() {
  const { user, isAuthenticated } = useAuth(); // Lấy thông tin xác thực từ context
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // TRẠNG THÁI DỮ LIỆU (DATA STATES)
  const [reports, setReports] = useState([]); // Danh sách lịch sử báo cáo
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu ban đầu
  const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi báo cáo mới
  
  // TRẠNG THÁI FORM BÁO CÁO (FORM STATES)
  const [selectedWasteTypes, setSelectedWasteTypes] = useState(["Nhựa"]); // Các loại rác đang chọn
  const [wasteItems, setWasteItems] = useState({
    "Nhựa": { description: "", imageFile: null, imagePreview: null }
  }); // Chi tiết cho từng loại rác đã chọn
  
  const [districts, setDistricts] = useState([]); // Danh sách các quận/huyện
  const [areas, setAreas] = useState([]); // Danh sách các khu vực thuộc quận/huyện được chọn
  const [selectedDistrictId, setSelectedDistrictId] = useState(user?.districtId || ""); // Quận/Huyện đang chọn
  const [selectedAreaId, setSelectedAreaId] = useState(user?.areaId || ""); // Khu vực đang chọn
  const [coords, setCoords] = useState(null); // Tọa độ (Vĩ độ, Kinh độ)
  const [expandedTypes, setExpandedTypes] = useState([selectedWasteTypes[0]]); // Các loại đang mở rộng (accordion)
  
  // TRẠNG THÁI PHẢN HỒI UI (UI STATES)
  const [toast, setToast] = useState(null); // Thông báo nhanh (Toast)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, reportId: null }); // Xác nhận xóa báo cáo
  const [selectedReport, setSelectedReport] = useState(null); // Báo cáo đang xem chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Trạng thái mở modal chi tiết

  /**
   * Hiển thị thông báo Toast trong thời gian ngắn
   */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Tính toán các thông tin liên quan đến hạng và điểm của người dùng
  const userPoints = user?.totalPoints ?? 0;
  const userRank = getRankFromPoints(userPoints).name;
  const { progress, needed, nextRank } = getRankProgress(userPoints);

  /**
   * Xử lý khi người dùng chọn file ảnh từ thiết bị
   */
  /**
   * Xử lý khi người dùng chọn file ảnh cho một loại rác cụ thể
   */
  const handleItemFileChange = (typeId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWasteItems(prev => ({
          ...prev,
          [typeId]: {
            ...prev[typeId],
            imageFile: file,
            imagePreview: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Hiệu ứng: Cuộn đến báo cáo cụ thể nếu có reportId trên URL (Deep Linking)
   */
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const reportId = params.get("reportId");
    if (reportId && reports.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`report-${reportId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-emerald-500", "bg-emerald-50");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-emerald-500", "bg-emerald-50");
          }, 5000);
        }
      }, 500);
    }
  }, [routerLocation.search, reports]);

  /**
   * Hiệu ứng: Lấy danh sách lịch sử báo cáo khi trang được tải hoặc khi đăng nhập
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    let cancelled = false;
    async function fetchReports() {
      try {
        const data = await getWasteReportsByCitizen(user?.id);
        if (!cancelled && Array.isArray(data)) {
          setReports(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // Sắp xếp mới nhất lên đầu
        }
      } catch {
        if (!cancelled) setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReports();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id, navigate]);

  /**
   * Hiệu ứng: Lấy danh sách Quận/Huyện khi component khởi chạy
   */
  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await getAllDistricts();
        if (res.success) {
          setDistricts(res.data);
        } else {
          console.error("API error fetching districts:", res.message);
        }
      } catch (err) {
        console.error("Failed to fetch districts", err);
      }
    }
    fetchDistricts();
  }, []);

  /**
   * Hiệu ứng: Lấy danh sách Khu vực khi Quận/Huyện thay đổi
   */
  useEffect(() => {
    if (!selectedDistrictId) {
      setAreas([]);
      setSelectedAreaId("");
      return;
    }
    async function fetchAreas() {
      try {
        const res = await getDistrictDetails(selectedDistrictId);
        if (res.success) {
          const fetchedAreas = res.data.areas || [];
          setAreas(fetchedAreas);
          // Kiểm tra xem khu vực hiện tại có còn nằm trong danh sách khu vực của quận mới không
          const areaExists = fetchedAreas.some(a => String(a.areaId) === String(selectedAreaId));
          if (!areaExists) {
            setSelectedAreaId("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch areas", err);
      }
    }
    fetchAreas();
  }, [selectedDistrictId]);

  /**
   * HÀM XỬ LÝ GỬI BÁO CÁO (SUBMIT)
   */
  const handleSubmit = async () => {
    // Ưu tiên dùng citizenId từ Profile, sau đó mới dùng ID thô từ Auth
    const rawId = user?.citizenId || user?.id || user?.userId;
    const finalId = rawId ? Number(rawId) : undefined;
    
    // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi
    if (!finalId || isNaN(finalId)) {
      showToast("Lỗi: Không tìm thấy ID người dùng hợp lệ. Vui lòng đăng nhập lại.", "error");
      return;
    }
    if (!selectedDistrictId) {
      showToast("Vui lòng chọn Quận/Huyện.", "error");
      return;
    }
    if (!selectedAreaId) {
      showToast("Vui lòng chọn Khu vực để tiếp tục.", "error");
      return;
    }
    if (selectedWasteTypes.length === 0) {
      showToast("Vui lòng chọn ít nhất một loại rác.", "error");
      return;
    }
    
    setSubmitting(true);
    try {
      // Sử dụng FormData để gửi đồng thời cả văn bản và tệp tin ảnh
      const formData = new FormData();
      formData.append("CitizenId", finalId);
      formData.append("AreaId", selectedAreaId);
      formData.append("Latitude", coords?.lat || 0);
      formData.append("Longitude", coords?.lon || 0);
      
      // Gửi mảng các item rác
      selectedWasteTypes.forEach((typeId, index) => {
        const item = wasteItems[typeId];
        formData.append(`Items[${index}].WasteType`, typeId);
        formData.append(`Items[${index}].Description`, (item?.description || "").trim());
        if (item?.imageFile) {
          formData.append(`Items[${index}].ImageFile`, item.imageFile);
        }
      });

      const result = await createWasteReport(formData);
      showToast("Báo cáo của bạn đã được gửi thành công!", "success");

      // Reset form sau khi gửi thành công
      setWasteItems({
        "Nhựa": { description: "", imageFile: null, imagePreview: null }
      });
      setSelectedWasteTypes(["Nhựa"]);
      setCoords(null);
      
      // Tải lại danh sách lịch sử để cập nhật báo cáo mới nhất
      const data = await getWasteReportsByCitizen(finalId);
      setReports(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
      showToast("Gửi báo cáo thất bại: " + errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * HÀM XỬ LÝ XÓA BÁO CÁO
   */
  const handleDelete = (reportId) => {
    setDeleteConfirm({ isOpen: true, reportId });
  };

  /**
   * Thực thi hành động xóa báo cáo sau khi đã xác nhận qua Modal
   */
  const executeDelete = async () => {
    const { reportId } = deleteConfirm;
    if (!reportId) return;

    try {
      await deleteWasteReport(reportId);
      // Tải lại danh sách lịch sử
      const rawId = user?.citizenId || user?.id || user?.userId;
      if (rawId) {
        const data = await getWasteReportsByCitizen(Number(rawId));
        setReports(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      showToast("Đã xóa báo cáo thành công.", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Xóa báo cáo thất bại. Vui lòng thử lại sau.", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, reportId: null });
    }
  };

  /**
   * Xử lý khi người dùng nhấn "Lưu" (Cập nhật) từ Modal chi tiết
   */
  const handleUpdate = async (reportId, updatedData) => {
    try {
      setSubmitting(true);
      await updateWasteReport(reportId, updatedData);
      showToast("Cập nhật báo cáo thành công!");
      setIsDetailModalOpen(false);
      
      // Refresh danh sách báo cáo
      if (user?.userId) {
        const data = await getWasteReportsByCitizen(user.userId);
        setReports(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error("Update failed:", error);
      showToast(error.response?.data || "Cập nhật thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Các hàm hỗ trợ hiển thị logic UI
  const displayStatus = (status) => STATUS_MAP[status] || status;
  const statusColor = (status) => STATUS_COLORS[displayStatus(status)] || "bg-gray-100 text-gray-800";
  
  /**
   * Tính toán điểm thưởng hiển thị cho từng báo cáo trog danh sách
   */
  const pointsDisplay = (report) => {
    const s = displayStatus(report.status);
    if (s === "Hoàn thành") {
      // Nếu có lịch sử điểm đi kèm thì cộng tổng, nếu không thì hiện mặc định +10
      if (report.pointHistories && report.pointHistories.length > 0) {
        const total = report.pointHistories.reduce((sum, ph) => sum + (ph.pointAmount || 0), 0);
        return total > 0 ? `+${total}` : total;
      }
      return "+10";
    }
    if (s === "Đã hủy") return "0";
    return "—"; // Các trạng thái đang xử lý chưa có điểm
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Modal xác nhận xóa để tránh người dùng nhấn nhầm */}
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, reportId: null })}
        onConfirm={executeDelete}
        title="Xác nhận xóa báo cáo"
        message="Bạn có chắc chắn muốn xóa báo cáo này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
      />

      {/* Modal xem chi tiết báo cáo */}
      <ReportDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        report={selectedReport}
        onDelete={(id) => {
           setIsDetailModalOpen(false);
           handleDelete(id);
        }}
        onSave={handleUpdate}
        submitting={submitting}
      />

      {/* Thông báo dạng Toast góc màn hình */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* PHẦN CHÀO MỪNG (WELCOME) */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, <span className="text-emerald-600">{user?.fullName}</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Báo cáo rác thải và theo dõi điểm thưởng của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: FORM BÁO CÁO (REPORT FORM) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Camera className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Báo cáo rác mới</h2>
            </div>

            <div className="space-y-4">

              {/* PHẦN CHỌN ĐỊA ĐIỂM (QUẬN & KHU VỰC) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-gray-900"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d.districtId} value={d.districtId}>
                        {d.districtName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khu vực <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    disabled={!selectedDistrictId}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-gray-900 disabled:opacity-50"
                  >
                    <option value="">Chọn khu vực</option>
                    {areas.map((a) => (
                      <option key={a.areaId} value={a.areaId}>
                        {a.areaName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PHẦN CHỌN LOẠI RÁC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Chọn loại rác bạn có
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {WASTE_TYPES.map((type) => {
                    const isSelected = selectedWasteTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedWasteTypes.length > 1) {
                              setSelectedWasteTypes(selectedWasteTypes.filter(t => t !== type.id));
                              // Giữ lại state cũ trong wasteItems trong trường hợp người dùng lỡ tay bấm nhầm rồi bấm lại
                            }
                          } else {
                            setSelectedWasteTypes([...selectedWasteTypes, type.id]);
                        setExpandedTypes(prev => [...prev, type.id]); // Mở rộng mục mới chọn
                        if (!wasteItems[type.id]) {
                              setWasteItems(prev => ({
                                ...prev,
                                [type.id]: { description: "", imageFile: null, imagePreview: null }
                              }));
                            }
                          }
                        }}
                        className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100 scale-[1.02]"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white"
                        }`}
                      >
                        <span className="text-3xl mb-2">{type.icon}</span>
                        <span
                          className={`text-sm font-semibold tracking-tight ${
                            isSelected ? "text-emerald-700" : "text-gray-600"
                          }`}
                        >
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN NHẬP THÔNG SỐ CHI TIẾT CHO TỪNG LOẠI RÁC */}
              <div className="space-y-6 pt-4">
                {selectedWasteTypes.map((typeId) => {
                  const typeInfo = WASTE_TYPES.find(t => t.id === typeId);
                  const itemState = wasteItems[typeId] || { description: "", imageFile: null, imagePreview: null };
                  const isExpanded = expandedTypes.includes(typeId) || selectedWasteTypes.length === 1;

                  return (
                    <div key={typeId} className="bg-emerald-50/50 rounded-2xl border border-emerald-100/50 overflow-hidden animate-fadeIn transition-all duration-300">
                      {/* Header của mục - Click để thu/mở */}
                      <div 
                        onClick={() => {
                          if (expandedTypes.includes(typeId)) {
                            setExpandedTypes(expandedTypes.filter(t => t !== typeId));
                          } else {
                            setExpandedTypes([...expandedTypes, typeId]);
                          }
                        }}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-emerald-100/30 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{typeInfo?.icon}</span>
                          <span className="font-bold text-emerald-800 uppercase text-xs tracking-wider">Thông số: {typeInfo?.label}</span>
                        </div>
                        <div className="text-emerald-500">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* Body của mục - Chỉ hiện khi isExpanded là true */}
                      <div className={`p-5 pt-0 space-y-4 transition-all duration-300 ${isExpanded ? "block" : "hidden"}`}>
                        <div className="border-t border-emerald-100/50 pt-4 space-y-4">

                      {/* Tải ảnh cho loại rác này */}
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-2 tracking-widest pl-1">
                          Hình ảnh {typeInfo?.label}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleItemFileChange(typeId, e)}
                          className="hidden"
                          id={`upload-${typeId}`}
                        />
                        <label
                          htmlFor={`upload-${typeId}`}
                          className="block border-2 border-dashed border-emerald-200 rounded-xl p-4 text-center hover:border-emerald-400 transition-all cursor-pointer overflow-hidden relative min-h-[120px] flex flex-col items-center justify-center bg-white/50"
                        >
                          {itemState.imagePreview ? (
                            <img
                              src={itemState.imagePreview}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <Camera className="mx-auto text-emerald-400 mb-2" size={24} />
                              <p className="text-xs text-emerald-600 font-medium">Nhấn để chọn ảnh từ máy</p>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Nhập mô tả cho loại rác này */}
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-2 tracking-widest pl-1">
                          Mô tả chi tiết
                        </label>
                        <textarea
                          value={itemState.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWasteItems(prev => ({
                              ...prev,
                              [typeId]: { ...prev[typeId], description: val }
                            }));
                          }}
                          rows={2}
                          placeholder={`Số lượng, tình trạng của rác ${typeInfo?.label.toLowerCase()}...`}
                          className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm placeholder-gray-400 resize-none"
                        />
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>

              {/* NÚT GỬI BÁO CÁO */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  submitting || !selectedAreaId || !selectedDistrictId || selectedWasteTypes.length === 0
                    ? "bg-gray-400"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                }`}
              >
                <Send size={18} />
                <span>{submitting ? "Đang gửi..." : "Gửi báo cáo"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: ĐIỂM THƯỞNG VÀ LỊCH SỬ (STATS & HISTORY) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* THẺ ĐIỂM THƯỞNG (REWARDS CARD) */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-emerald-100 text-sm mb-1">Điểm thưởng tích lũy</p>
                <h3 className="text-4xl font-bold">
                  {userPoints.toLocaleString()} <span className="text-2xl">pts</span>
                </h3>
                <div className="mt-2 inline-block bg-emerald-400 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Hạng {userRank}
                </div>
                {nextRank && needed > 0 && (
                  <p className="text-emerald-100 text-sm mt-2">
                    Còn {needed} điểm để lên Hạng {nextRank.name}
                  </p>
                )}
              </div>
              <Link
                to="/rewards"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Đổi quà
              </Link>
            </div>
            {/* Thanh tiến trình nâng hạng */}
            <div className="w-full bg-emerald-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* DANH SÁCH LỊCH SỬ BÁO CÁO (REPORT HISTORY) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Lịch sử báo cáo</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Của bạn</span>
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Tiêu đề bảng lịch sử */}
              <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr_50px] gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
                <div>Thời gian</div>
                <div>Loại rác</div>
                <div>Trạng thái</div>
                <div className="text-right pr-2">Điểm</div>
                <div className="text-center">Xem</div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải...</div>
              ) : reports.length === 0 ? (
                // Hiển thị khi chưa có dữ liệu báo cáo nào
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Recycle className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 mb-2">Chưa có báo cáo nào</p>
                  <p className="text-sm text-gray-400">
                    Gửi báo cáo rác ở form bên trái để bắt đầu tích điểm
                  </p>
                </div>
              ) : (
                // Hiển thị danh sách các báo cáo
                reports.map((report) => (
                  <div
                    key={report.reportId}
                    id={`report-${report.reportId}`}
                    className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr_50px] gap-4 py-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-all rounded-xl px-2 group"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(report.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(report.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">
                        {report.wasteType || "—"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                          report.status
                        )}`}
                      >
                        {displayStatus(report.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end pr-2">
                      <span className="text-emerald-600 font-bold tabular-nums">
                        {pointsDisplay(report)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all transform hover:scale-110"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MẸO VÈ TÍCH ĐIỂM (TIPS SECTION) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-emerald-900 mb-1">
                  Mẹo tích điểm nhanh
                </h4>
                <p className="text-sm text-emerald-800">
                  Chọn đúng khu vực và phân loại rác chính xác để được thu gom nhanh và
                  nhận điểm thưởng khi đơn hoàn thành.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component hiển thị chi tiết báo cáo rác (Detail Modal)
 */
const ReportDetailModal = ({ isOpen, onClose, report, onDelete, onSave, submitting }) => {
  const [desc, setDesc] = useState("");
  const [wType, setWType] = useState("");

  useEffect(() => {
    if (report) {
       setDesc(report.description || "");
       setWType(report.wasteType || "");
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const isPending = report.status === 0 || report.status === "Pending" || report.status === "pending";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
        
        {/* Nút đóng (X) */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10 bg-white/80 backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        <div className="p-5 sm:p-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Recycle className="text-emerald-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Chi tiết báo cáo rác</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Mã số: #{report.reportId}</p>
            </div>
          </div>

            {/* Danh sách các mục rác chi tiết */}
            <div className="md:col-span-2">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Chi tiết danh mục rác ({report.wasteReportItems?.length || 0})
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.wasteReportItems && report.wasteReportItems.length > 0 ? (
                  report.wasteReportItems.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex flex-col space-y-3 border border-gray-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                            {item.wasteType}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        {/* Hình ảnh mục này */}
                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-200">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:61436${item.imageUrl}`} 
                              alt={item.wasteType} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Camera size={16} />
                            </div>
                          )}
                        </div>
                        
                        {/* Mô tả mục này */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Thông số / Mô tả</p>
                          <p className="text-gray-700 text-sm line-clamp-3 leading-snug">
                            {item.description || "Không có mô tả chi tiết"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Hiển thị cũ nếu là báo cáo đời cũ không có items */
                  <div className="sm:col-span-2 bg-gray-50 rounded-2xl p-6 flex space-x-6 items-start">
                    <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                      {report.reportImages && report.reportImages.length > 0 ? (
                        <img 
                          src={report.reportImages[0].imageurl.startsWith('http') ? report.reportImages[0].imageurl : `http://localhost:61436${report.reportImages[0].imageurl}`} 
                          alt="Report" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Camera size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Thông tin chung (Legacy)</p>
                      <p className="font-bold text-gray-800 mb-1">{report.wasteType}</p>
                      <p className="text-gray-600 text-sm italic">{report.description || "Không có mô tả"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Chân modal: Nút hành động */}
          {isPending && (
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onDelete(report.reportId)}
                className="px-6 py-2.5 sm:py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center space-x-2 border border-transparent hover:border-red-100"
              >
                <Trash2 size={18} />
                <span>Xóa báo cáo</span>
              </button>
              <button
                disabled={submitting}
                onClick={() => onSave(report.reportId, { description: desc, wasteType: wType, areaId: report.areaId })}
                className="px-8 py-2.5 sm:py-3 bg-emerald-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:shadow-none"
              >
                <span>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportWaste;
