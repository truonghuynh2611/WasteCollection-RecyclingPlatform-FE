import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Camera, MapPin, Send, Filter, Recycle, ArrowRight, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createWasteReport, getWasteReportsByCitizen, deleteWasteReport } from "../../api/waste";
import { getAllDistricts, getDistrictDetails } from "../../api/district";
import Toast from "../common/Toast";
import ConfirmModal from "../common/ConfirmModal";

const RANKS = [
  { name: "Đồng", min: 0 },
  { name: "Bạc", min: 250 },
  { name: "Vàng", min: 1000 },
  { name: "Kim cương", min: 2500 },
];

const WASTE_TYPES = [
  { id: "Giấy", label: "Giấy", icon: "📄" },
  { id: "Nhựa", label: "Nhựa", icon: "🗑️" },
  { id: "Kim loại", label: "Kim loại", icon: "⚙️" },
];

const STATUS_MAP = {
  // Mapping for integer enum values from Backend (ReportStatus.cs)
  0: "Đang chờ",
  1: "Chấp nhận",
  2: "Đã phân công",
  3: "Đang đến",
  4: "Hoàn thành",
  5: "Đã hủy",
  
  // Mapping for string enum names (PascalCase from Backend)
  "Pending": "Đang chờ",
  "Accepted": "Chấp nhận",
  "Assigned": "Đã phân công",
  "OnTheWay": "Đang đến",
  "Collected": "Hoàn thành",
  "Failed": "Đã hủy",
};

const STATUS_COLORS = {
  "Đang chờ": "bg-yellow-100 text-yellow-800",
  "Chấp nhận": "bg-blue-100 text-blue-800",
  "Đã phân công": "bg-indigo-100 text-indigo-800",
  "Đang đến": "bg-purple-100 text-purple-800",
  "Hoàn thành": "bg-green-100 text-green-800",
  "Đã hủy": "bg-red-100 text-red-800",
};

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

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("vi-VN");
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportWaste() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const routerLocation = useLocation();

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
  const [submitting, setSubmitting] = useState(false);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState(["Nhựa"]);
  
  // Address states initialized from user profile if available
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(user?.districtId || "");
  const [selectedAreaId, setSelectedAreaId] = useState(user?.areaId || "");
  const [coords, setCoords] = useState(null); // { lat, lon }
  const [location, setLocation] = useState(""); // Still used for internal ref or fallback
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, reportId: null });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const userPoints = user?.totalPoints ?? 0;
  const userRank = getRankFromPoints(userPoints).name;
  const { progress, needed, nextRank } = getRankProgress(userPoints);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
          setReports(data);
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

  // Fetch districts on mount
  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await getAllDistricts();
        if (res.success) {
          setDistricts(res.data);
          if (res.data.length === 0) console.warn("API returned empty districts list");
        } else {
          console.error("API error fetching districts:", res.message);
        }
      } catch (err) {
        console.error("Failed to fetch districts", err);
      }
    }
    fetchDistricts();
  }, []);

  // Fetch areas when district changes
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
          setAreas(res.data.areas || []);
          // Only clear areaId if the current selectedAreaId is not found in the new area list
          // This prevents clearing the pre-filled value from the user profile on initial load.
          const areaExists = res.data.areas?.some(a => String(a.areaId) === String(selectedAreaId));
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

  const handleSubmit = async () => {
    // Ưu tiên dùng citizenId nếu có (từ BE), rồi mới đến id/userId
    const rawId = user?.citizenId || user?.id || user?.userId || user?.UserId;
    const finalId = rawId ? Number(rawId) : undefined;
    
    // Debug log
    console.log("Submitting report with ID:", finalId, "from user object:", user);

    if (!finalId || isNaN(finalId)) {
      console.error("DEBUG: Không tìm thấy ID hợp lệ trong đối tượng user:", user);
      showToast("Lỗi: Không tìm thấy ID người dùng hợp lệ. Vui lòng đăng xuất và đăng nhập lại.", "error");
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
      const formData = new FormData();
      // Đảm bảo gửi ID đúng (ưu tiên CitizenId thực sự từ BE)
      formData.append("CitizenId", finalId);
      formData.append("AreaId", selectedAreaId);
      formData.append("WasteType", selectedWasteTypes.join(", "));
      formData.append("Description", description.trim());
      formData.append("Latitude", coords?.lat || 0);
      formData.append("Longitude", coords?.lon || 0);
      
      if (imageFile) {
        formData.append("ImageFile", imageFile);
      }

      const result = await createWasteReport(formData);
      console.log("Submit success:", result);
      
      showToast("Báo cáo của bạn đã được gửi thành công!", "success");

      // Reset form
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setCoords(null);
      
      // Refresh list
      const data = await getWasteReportsByCitizen(finalId);
      setReports(data);
    } catch (err) {
      console.error("Submit error:", err);
      // Hiển thị chi tiết lỗi nếu có
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Lỗi không xác định";
      showToast("Gửi báo cáo thất bại: " + (typeof errorMsg === 'string' ? errorMsg : "Vui lòng kiểm tra lại thông tin."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (reportId) => {
    setDeleteConfirm({ isOpen: true, reportId });
  };

  const executeDelete = async () => {
    const { reportId } = deleteConfirm;
    if (!reportId) return;

    try {
      await deleteWasteReport(reportId);
      // Refresh list dùng ID Citizen
      const rawId = user?.citizenId || user?.id || user?.userId || user?.UserId;
      if (rawId) {
        const data = await getWasteReportsByCitizen(Number(rawId));
        setReports(data);
      }
      showToast("Đã xóa báo cáo thành công.", "success");
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Lỗi không xác định";
      showToast("Xóa báo cáo thất bại: " + (typeof errorMsg === 'string' ? errorMsg : "Vui lòng thử lại sau."), "error");
    } finally {
      setDeleteConfirm({ isOpen: false, reportId: null }); // Close modal after attempt
    }
  };

  const displayStatus = (status) =>
    STATUS_MAP[status] || status;
  const statusColor = (status) =>
    STATUS_COLORS[displayStatus(status)] || "bg-gray-100 text-gray-800";
  const pointsDisplay = (report) => {
    const s = displayStatus(report.status);
    if (s === "Hoàn thành") {
      // Sum points from pointHistories if available (linked since the recent fix)
      if (report.pointHistories && report.pointHistories.length > 0) {
        const total = report.pointHistories.reduce((sum, ph) => sum + (ph.pointAmount || 0), 0);
        return total > 0 ? `+${total}` : total;
      }
      return "+10"; // Fallback for old records or if history is not yet linked
    }
    if (s === "Đã hủy") {
      if (report.pointHistories && report.pointHistories.length > 0) {
        const total = report.pointHistories.reduce((sum, ph) => sum + (ph.pointAmount || 0), 0);
        return total;
      }
      return "0";
    }
    return "—";
  };


  const handleSelectAddress = () => {
    // Placeholder for map selection logic
    console.log("Mở bản đồ chọn địa chỉ...");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, reportId: null })}
        onConfirm={executeDelete}
        title="Xác nhận xóa báo cáo"
        message="Bạn có chắc chắn muốn xóa báo cáo này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, <span className="text-emerald-600">{user?.fullName}</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Báo cáo rác thải và theo dõi điểm thưởng của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form báo cáo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Camera className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Báo cáo rác mới</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh hiện trường (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer overflow-hidden relative min-h-[160px] flex flex-col items-center justify-center"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="mx-auto text-gray-400 mb-2" size={28} />
                      <p className="text-sm text-gray-500">Nhấn để tải ảnh lên</p>
                      <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng: JPG, PNG</p>
                    </>
                  )}
                </label>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phân loại rác tại nguồn
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
                            }
                          } else {
                            setSelectedWasteTypes([...selectedWasteTypes, type.id]);
                          }
                        }}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl mb-1">{type.icon}</span>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-emerald-700" : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả thêm (không bắt buộc)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú về khối lượng hoặc loại rác cụ thể..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

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

        {/* Điểm thưởng + Lịch sử */}
        <div className="lg:col-span-2 space-y-6">
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
            <div className="w-full bg-emerald-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Lịch sử báo cáo</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Của bạn</span>
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                <div>THỜI GIAN</div>
                <div>LOẠI RÁC</div>
                <div>TRẠNG THÁI</div>
                <div className="text-right">ĐIỂM</div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải...</div>
              ) : reports.length === 0 ? (
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
                reports.map((report) => (
                  <div
                    key={report.reportId}
                    id={`report-${report.reportId}`}
                    className="grid grid-cols-4 gap-4 py-4 border-b last:border-0 hover:bg-gray-50 transition-all rounded-lg px-2"
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
                    <div className="text-right flex items-center justify-end space-x-2">
                      <span className="text-emerald-600 font-semibold">
                        {pointsDisplay(report)}
                      </span>
                      {(report.status === 0 || report.status === "Pending" || report.status === "pending") && (
                        <button
                          onClick={() => handleDelete(report.reportId)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
                          title="Xóa báo cáo"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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

export default ReportWaste;
