// Nhập React từ thư viện lõi
import React from 'react';
// Nhập các icon từ thư viện lucide-react để minh họa mức độ cảnh báo
import { AlertTriangle, X } from 'lucide-react';

/**
 * COMPONENT: ConfirmModal
 * Dùng để hiển thị hộp thoại xác nhận trước khi thực hiện các hành động quan trọng (ví dụ: Xóa)
 */
const ConfirmModal = ({ 
  isOpen,       // Trạng thái mở/đóng của modal
  onClose,      // Hàm xử lý khi nhấn Hủy hoặc đóng modal
  onConfirm,    // Hàm xử lý khi người dùng nhấn Xác nhận
  title = "Xác nhận xóa", // Tiêu đề mặc định
  message = "Bạn có chắc chắn muốn thực hiện thao tác này? Thao tác này không thể hoàn tác.", // Nội dung cảnh báo
  confirmText = "Xác nhận xóa", // Chữ trên nút xác nhận
  cancelText = "Hủy bỏ",        // Chữ trên nút hủy
  type = "danger" // Loại modal: 'danger' (đỏ - nguy hiểm) hoặc 'warning' (cam - cảnh báo)
}) => {
  // Nếu modal không được mở, trả về null để không render gì cả
  if (!isOpen) return null;

  return (
    /* LỚP PHỦ NỀN (Backdrop): Làm mờ và tối vùng phía sau modal */
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      
      {/* NỘI DUNG MODAL CHÍNH */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài làm đóng modal nhầm
      >
        <div className="relative p-6">
          {/* NÚT ĐÓNG (Dấu X ở góc phải) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* VÙNG HIỂN THỊ ICON VÀ NỘI DUNG CHÍNH */}
          <div className="flex flex-col items-center text-center mt-2">
            {/* Vòng tròn chứa Icon cảnh báo, màu sắc thay đổi theo 'type' */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
            }`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* PHẦN CHÂN MODAL: Chứa các nút bấm hành động */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          {/* NÚT XÁC NHẬN: Thực hiện hành động và đóng modal */}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg active:scale-95 ${
              type === 'danger' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
            }`}
          >
            {confirmText}
          </button>
          
          {/* NÚT HỦY BỎ: Chỉ đóng modal mà không làm gì thêm */}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
