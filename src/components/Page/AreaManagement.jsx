// Nhập các React hook cần thiết để quản lý trạng thái và vòng đời component
import { useState, useEffect } from "react";
// Nhập các icon từ thư viện lucide-react để minh họa giao diện
import {
  MapPin, Users, UserCheck, ChevronDown, ChevronUp, Plus,
  Search, Eye, X
} from "lucide-react";
// Nhập Sidebar dùng chung cho bố cục trang quản trị
import Sidebar from "../Layouts/Sidebar";
// Nhập các hàm gọi API tương ứng với nghiệp vụ quản lý khu vực
import { getAllAreas, createArea, updateArea, deleteArea } from "../../api/area";
import { getAllDistricts } from "../../api/district";
import { toast } from "react-hot-toast"; // assuming toast is used

// Định nghĩa kiểu dáng (CSS classes) cho các trạng thái của khu vực
const statusStyle = {
  "Hoạt động": "bg-green-100 text-green-700",
  "Thiếu quản lí": "bg-amber-100 text-amber-700",
  "Tạm dừng": "bg-red-100 text-red-600",
};

// Định nghĩa màu sắc biểu thị trạng thái hoạt động của nhân sự
const staffStatusDot = {
  "Hoạt động": "bg-green-500",
  "Nghỉ phép": "bg-yellow-500",
  "Bị khóa": "bg-red-500",
};

/**
 * COMPONENT QUẢN LÝ KHU VỰC (AREA MANAGEMENT)
 * Cho phép xem danh sách, thêm, và xem chi tiết các khu vực thu gom
 */
export default function AreaManagement() {
  // KHAI BÁO CÁC TRẠNG THÁI (STATE)
  const [search, setSearch] = useState(""); // Lưu từ khóa tìm kiếm
  const [expandedId, setExpandedId] = useState(null); // Lưu ID khu vực đang được mở rộng danh sách đội
  const [selectedArea, setSelectedArea] = useState(null); // Khu vực được chọn để xem chi tiết trong Modal
  const [showAddModal, setShowAddModal] = useState(false); // Trạng thái ẩn/hiện Modal thêm mới
  const [newArea, setNewArea] = useState({ name: "", district: "" }); // Dữ liệu khu vực mới
  const [areas, setAreas] = useState([]); // Danh sách khu vực lấy từ API
  const [districts, setDistricts] = useState([]); // Danh sách quận huyện
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [isEditing, setIsEditing] = useState(false); // Đang sửa hay thêm mới

  // Effect: Tự động tải danh sách khu vực khi lần đầu load trang
  useEffect(() => {
    fetchAreas();
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const data = await getAllDistricts();
      if (data && data.success) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách quận huyện:", error);
    }
  };

  // Hàm gọi API lấy toàn bộ danh sách khu vực
  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await getAllAreas();
      setAreas(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khu vực:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lưu khu vực (Thêm mới hoặc Cập nhật)
  const handleSaveArea = async () => {
    if (!newArea.name || !newArea.districtId) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const payload = {
        name: newArea.name,
        districtId: parseInt(newArea.districtId)
      };

      if (isEditing && selectedArea) {
        await updateArea(selectedArea.areaId, payload);
        toast.success("Cập nhật khu vực thành công");
      } else {
        await createArea(payload);
        toast.success("Thêm khu vực mới thành công");
      }

      setShowAddModal(false);
      setIsEditing(false);
      setNewArea({ name: "", districtId: "" });
      fetchAreas();
    } catch (error) {
      const msg = error.response?.data?.message || "Đã có lỗi xảy ra";
      toast.error(msg);
      console.error("Lỗi khi lưu khu vực:", error);
    }
  };

  // Hàm xóa khu vực
  const handleDeleteArea = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khu vực này?")) return;

    try {
      await deleteArea(id);
      toast.success("Xóa khu vực thành công");
      fetchAreas();
    } catch (error) {
      toast.error("Không thể xóa khu vực này");
      console.error("Lỗi khi xóa khu vực:", error);
    }
  };

  // Logic lọc danh sách dựa trên từ khóa tìm kiếm (theo tên khu vực hoặc tên quận)
  const filtered = areas.filter(a =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.district?.districtName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Hàm đóng/mở phần chi tiết đội thu gom dưới mỗi Card
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  // Tính tổng số đội thu gom từ tất cả khu vực
  const totalTeams = areas.reduce((sum, a) => sum + (a.teamCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR ĐIỀU HƯỚNG */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">

            {/* PHẦN ĐẦU TRANG: TIÊU ĐỀ VÀ NÚT THÊM MỚI */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý khu vực</h1>
                <p className="text-gray-500 mt-1">Phân công quản lí và người thu gom theo từng khu vực</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm khu vực
              </button>
            </div>

            {/* BẢNG THỐNG KÊ NHANH (STATS GRID) */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tổng khu vực", value: areas.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: areas.length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Tổng đội thu gom", value: totalTeams, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-gray-200 p-5 shadow-sm`}>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Ô TÌM KIẾM KHU VỰC */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khu vực, quận..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="text-sm text-gray-500">{filtered.length} khu vực</span>
            </div>

            {/* DANH SÁCH CÁC CARD KHU VỰC */}
            <div className="space-y-3">
              {loading ? (
                // Hiển thị Skeleton loading khi đang tải dữ liệu
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse"></div>
                ))
              ) : filtered.map(area => (
                <div key={area.areaId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* HÀNG THÔNG TIN CHÍNH (HEADER ROW) */}
                  <div className="flex items-center gap-4 px-6 py-5">
                    {/* Icon đại diện khu vực */}
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>

                    {/* Thông tin tên và quận */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-gray-800">{area.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle["Hoạt động"]}`}>Hoạt động</span>
                      </div>
                      <p className="text-sm text-gray-500">{area.district?.districtName || "Chưa xác định"}</p>
                    </div>


                    {/* Số lượng đội thu gom */}
                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-gray-800">{area.teamCount || 0}</p>
                      <p className="text-xs text-gray-400">Đội thu gom</p>
                    </div>

                    {/* Tổng số báo cáo rác */}
                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-green-600">{area.totalReports || 0}</p>
                      <p className="text-xs text-gray-400">Báo cáo</p>
                    </div>

                    {/* Các nút hành động (Xem chi tiết, Mở rộng danh sách đội) */}
                    <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                      <button
                        onClick={() => setSelectedArea(area)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setNewArea({ name: area.name, districtId: area.districtId });
                          setSelectedArea(area);
                          setShowAddModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Sửa khu vực"
                      >
                        <Plus className="w-4 h-4 rotate-45" /> {/* Use Plus as Edit icon or similar if Pen not imported */}
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.areaId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa khu vực"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggle(area.areaId)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>Đội thu gom</span>
                        {expandedId === area.areaId
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* VÙNG NỘI DUNG MỞ RỘNG (EXPANDED CONTENT) */}
                  {expandedId === area.areaId && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Danh sách đội thu gom khu vực {area.name}
                      </p>
                      <div className="text-sm text-gray-500 italic">
                        Tính năng xem chi tiết đội ngũ đang được cập nhật...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL XEM CHI TIẾT KHU VỰC */}
      {selectedArea && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedArea(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedArea.name}</h3>
                  <p className="text-sm text-gray-500">{selectedArea.district?.districtName || "Chưa xác định"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedArea(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Mã khu vực</span>
                <span className="font-semibold text-gray-800">#{selectedArea.areaId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Số đội thu gom</span>
                <span className="font-semibold text-blue-600">{selectedArea.teamCount || 0} đội</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Tổng báo cáo</span>
                <span className="font-semibold text-green-600">{selectedArea.totalReports || 0}</span>
              </div>
            </div>


            <button onClick={() => setSelectedArea(null)} className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL THÊM KHU VỰC MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Thêm khu vực mới</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khu vực *</label>
                <input
                  type="text"
                  placeholder="VD: Khu vực 3B"
                  value={newArea.name}
                  onChange={e => setNewArea(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện *</label>
                <select
                  value={newArea.districtId}
                  onChange={e => setNewArea(prev => ({ ...prev, districtId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Chọn quận huyện...</option>
                  {districts.map(d => (
                    <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setIsEditing(false);
                  setNewArea({ name: "", districtId: "" });
                }} 
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveArea}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                {isEditing ? "Cập nhật" : "Tạo khu vực"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
