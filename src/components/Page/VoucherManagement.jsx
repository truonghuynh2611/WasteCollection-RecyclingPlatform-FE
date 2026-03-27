// Nhập các React hook cần thiết (useState: quản lý trạng thái, useEffect: hiệu ứng phụ, useRef: tham chiếu DOM)
import { useState, useEffect, useRef } from "react";
// Nhập các icon từ thư viện lucide-react để làm đẹp giao diện trang quản lý
import {
  Ticket, Plus, Search, Eye, X, Edit, Trash2, 
  AlertCircle, CheckCircle2, MoreVertical, RefreshCw,
  Image as ImageIcon, Tag, Clock, AlignLeft, Hash, Upload, Loader2
} from "lucide-react";
// Nhập Sidebar dùng chung cho bố cục Admin
import Sidebar from "../Layouts/Sidebar";
// Nhập các hàm gọi API liên quan đến quản lý Voucher từ thư mục api
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, uploadVoucherImage } from "../../api/voucher";
// Nhập component Modal xác nhận dùng chung
import ConfirmModal from "../common/ConfirmModal";

// Cấu hình URL cơ sở cho API và hàm xử lý đường dẫn ảnh (đảm bảo hiển thị đúng ảnh từ server)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
const getImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : null;

// Danh sách các loại danh mục Voucher mẫu
const CATEGORIES = ["Ẩm thực", "Di chuyển", "Mua sắm", "Tiện ích", "Giải trí", "Khác"];

/**
 * COMPONENT TRANG QUẢN LÝ VOUCHER (VOUCHER MANAGEMENT)
 * Chức năng: Xem danh sách, thêm mới, chỉnh sửa, xóa và tải ảnh cho Voucher
 */
export default function VoucherManagement() {
  // CÁC TRẠNG THÁI (STATE) QUẢN LÝ DỮ LIỆU VÀ GIAO DIỆN
  const [vouchers, setVouchers] = useState([]); // Danh sách voucher từ backend
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [search, setSearch] = useState(""); // Từ khóa tìm kiếm
  const [showModal, setShowModal] = useState(false); // Trạng thái đóng/mở Modal Thêm/Sửa
  const [modalMode, setModalMode] = useState("add"); // Chế độ Modal: "add" (Thêm) hoặc "edit" (Sửa)
  const [currentVoucher, setCurrentVoucher] = useState(null); // Voucher đang được chọn để sửa
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang tải ảnh lên server
  const fileInputRef = useRef(null); // Tham chiếu tới ô input file ẩn

  // Trạng thái dữ liệu trong Form
  const [formData, setFormData] = useState({
    voucherName: "",
    description: "",
    voucherCode: "",
    image: "",
    category: "Ẩm thực",
    expiryDays: 30,
    pointsRequired: 0,
    stockQuantity: 0,
    status: true
  });

  // Trạng thái phục vụ việc Xóa Voucher
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);

  // Gọi API lấy danh sách ngay khi component được render lần đầu
  useEffect(() => {
    fetchVouchers();
  }, []);

  // Hàm gọi API lấy toàn bộ danh sách Voucher
  const fetchVouchers = async () => {
    setLoading(true);
    const result = await getVouchers();
    if (result.success) {
      setVouchers(result.data);
    }
    setLoading(false);
  };

  // Hàm chuẩn bị dữ liệu khi click nút "Thêm mới"
  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      voucherName: "",
      description: "",
      voucherCode: "",
      image: "",
      category: "Ẩm thực",
      expiryDays: 30,
      pointsRequired: 0,
      stockQuantity: 0,
      status: true
    });
    setShowModal(true);
  };

  // Hàm chuẩn bị dữ liệu khi click nút "Chỉnh sửa" (đưa thông tin cũ vào form)
  const handleOpenEdit = (voucher) => {
    setModalMode("edit");
    setCurrentVoucher(voucher);
    setFormData({
      voucherName: voucher.voucherName || "",
      description: voucher.description || "",
      voucherCode: voucher.voucherCode || "",
      image: voucher.image || "",
      category: voucher.category || "Ẩm thực",
      expiryDays: voucher.expiryDays || 30,
      pointsRequired: voucher.pointsRequired || 0,
      stockQuantity: voucher.stockQuantity || 0,
      status: voucher.status ?? true
    });
    setShowModal(true);
  };

  // Hàm xử lý việc tải ảnh lên server
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadVoucherImage(file);
      if (result.success) {
        // Cập nhật đường dẫn ảnh mới trả về từ server vào form
        setFormData(prev => ({ ...prev, image: result.imageUrl }));
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Tải ảnh lên thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  // Hàm xử lý khi nhấn nút Lưu (Gửi dữ liệu lên backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const result = await createVoucher(formData);
      if (result.success) {
        setShowModal(false);
        fetchVouchers(); // Làm mới danh sách sau khi thêm
      }
    } else {
      const result = await updateVoucher(currentVoucher.voucherId, formData);
      if (result.success) {
        setShowModal(false);
        fetchVouchers(); // Làm mới danh sách sau khi sửa
      }
    }
  };

  // Hàm xử lý khi nhấn nút Xóa (mở Modal xác nhận)
  const handleDeleteClick = (voucher) => {
    setVoucherToDelete(voucher);
    setShowDeleteConfirm(true);
  };

  // Hàm thực thi việc xóa Voucher sau khi đã xác nhận
  const executeDelete = async () => {
    if (voucherToDelete) {
      const result = await deleteVoucher(voucherToDelete.voucherId);
      if (result.success) {
        fetchVouchers();
      }
    }
  };

  // Lọc danh sách Voucher hiển thị dựa trên ô tìm kiếm (theo tên hoặc danh mục)
  const filtered = vouchers.filter(v =>
    v.voucherName.toLowerCase().includes(search.toLowerCase()) ||
    (v.category && v.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar bên trái */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="w-full">
            
            {/* PHẦN TIÊU ĐỀ (HEADER) */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Voucher</h1>
                <p className="text-gray-500 mt-1">Thiết lập và quản lý danh sách quà tặng đổi điểm</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm Voucher
              </button>
            </div>

            {/* THẺ THỐNG KÊ NHANH (STATS) */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: "Tổng số Voucher", value: vouchers.length, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Đang hoạt động", value: vouchers.filter(v => v.status).length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                { label: "Hết hàng", value: vouchers.filter(v => v.stockQuantity === 0).length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm`}>
                  <div className={`p-3 rounded-xl bg-white ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* THANH TÌM KIẾM VÀ LÀM MỚI (SEARCH & FILTERS) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm voucher, danh mục..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button 
                onClick={fetchVouchers}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-100"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* BẢNG DỮ LIỆU VOUCHER (TABLE) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Voucher</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Điểm / Tồn kho</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        Đang tải danh sách...
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map((voucher) => (
                      <tr key={voucher.voucherId} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {/* Hiển thị ảnh Voucher hoặc icon mặc định */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-green-600 shrink-0 border border-gray-200">
                              {voucher.image ? (
                                <img src={getImageUrl(voucher.image)} alt={voucher.voucherName} className="w-full h-full object-cover" />
                              ) : (
                                <Ticket className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{voucher.voucherName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Code: {voucher.voucherCode || "---"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            {voucher.category || "Chưa phân loại"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-orange-600">{voucher.pointsRequired} Điểm</span>
                            <span className={`text-[11px] font-medium ${voucher.stockQuantity < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                              Còn {voucher.stockQuantity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            voucher.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {voucher.status ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEdit(voucher)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(voucher)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Ticket className="w-12 h-12 mb-3 opacity-20" />
                          <p>Không tìm thấy voucher nào</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL THÊM / SỬA VOUCHER */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {modalMode === "add" ? "Thêm Voucher mới" : "Chỉnh sửa Voucher"}
                </h3>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Mới</span>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* CỘT TRÁI (LEFT COLUMN): Thông tin cơ bản */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <Ticket className="w-4 h-4 text-green-500" /> Tên Voucher *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ví dụ: Voucher Bách Hóa Xanh 100k"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.voucherName}
                      onChange={e => setFormData({...formData, voucherName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <Tag className="w-4 h-4 text-blue-500" /> Danh mục
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <Hash className="w-4 h-4 text-orange-500" /> Mã giảm giá (Code) *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ví dụ: BHX100KOFF"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.voucherCode}
                      onChange={e => setFormData({...formData, voucherCode: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Điểm đổi *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.pointsRequired}
                        onChange={e => setFormData({...formData, pointsRequired: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số lượng *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.stockQuantity}
                        onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI (RIGHT COLUMN): Hình ảnh và mô tả */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-500" /> Upload hình ảnh *
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all overflow-hidden group"
                    >
                      {formData.image ? (
                        <>
                          <img src={getImageUrl(formData.image)} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold flex items-center gap-2">
                              <Upload size={14} /> Thay đổi ảnh
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          {isUploading ? (
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-gray-400 group-hover:text-green-500 transition-colors">
                                <Upload size={20} />
                              </div>
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tải ảnh lên</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic px-1">Tự động lưu vào thư mục voucher của hệ thống</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <Clock className="w-4 h-4 text-red-500" /> Hạn sử dụng (ngày)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ví dụ: 30"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.expiryDays}
                      onChange={e => setFormData({...formData, expiryDays: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <AlignLeft className="w-4 h-4 text-gray-500" /> Mô tả ngắn
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Mô tả về điều kiện sử dụng voucher..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN ĐIỀU KHIỂN DƯỚI CÙNG (FOOTER ACTIONS) */}
              <div className="flex items-center gap-3 py-4 border-t border-gray-100 mt-6">
                <div 
                  onClick={() => setFormData({...formData, status: !formData.status})}
                  className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${formData.status ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.status ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Đang cho phép đổi</span>
                
                <div className="flex-1 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className={`px-8 py-2.5 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-green-100'
                    }`}
                  >
                    {isUploading ? "Đang xử lý..." : (modalMode === "add" ? "Tạo Voucher" : "Lưu thay đổi")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA (CONFIRM DELETE) */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="Xác nhận xóa Voucher"
        message={`Bạn có chắc chắn muốn xóa voucher "${voucherToDelete?.voucherName}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xoá Voucher"
        cancelText="Để tôi xem lại"
        type="danger"
      />
    </div>
  );
}
