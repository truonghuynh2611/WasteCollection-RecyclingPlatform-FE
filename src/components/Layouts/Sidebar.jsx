// Nhập các icon từ thư viện lucide-react để minh họa các mục trong menu
import {
  LayoutGrid,
  ClipboardList,
  Users,
  UserCog,
  CalendarDays,
  Map,
  MapPin,
  Settings,
  Recycle,
} from "lucide-react";
// Nhập hook điều hướng và lấy URL hiện tại từ react-router-dom
import { useNavigate, useLocation } from "react-router-dom";

/**
 * DANH SÁCH MENU CHÍNH (PHẦN QUẢN TRỊ)
 * Bao gồm ID để định danh, Nhãn hiển thị, Icon đại diện và Path để điều hướng
 */
const mainMenuItems = [
  { id: "dashboard", label: "Bảng điều khiển", icon: LayoutGrid, path: "/admin" },
  { id: "requests", label: "Yêu cầu thu gom", icon: ClipboardList, path: "/reportManagement" },
  { id: "users", label: "Quản lý người dùng", icon: Users, path: "/userManagement" },
  { id: "collector", label: "Quản lý người thu gom", icon: UserCog, path: "/collectorManagement" },
  { id: "location", label: "Quản lý khu vực", icon: MapPin, path: "/locationManagement" },
  { id: "team", label: "Quản lý đội ngũ", icon: Users, path: "/teamManagement" },
];

/**
 * DANH SÁCH MENU HOẠT ĐỘNG (BỔ TRỢ)
 */
const activityMenuItems = [
  { id: "vouchers", label: "Quản lý Voucher", icon: Recycle, path: "/voucherManagement" },
  { id: "settings", label: "Cấu hình điểm thưởng", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Dùng để xác định menu nào đang được chọn dựa trên URL

  /**
   * HÀM RENDER CÁC MỤC MENU
   * Tự động áp dụng style "Active" nếu path của menu khớp với URL hiện tại
   */
  const renderMenuItems = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path; // Kiểm tra trạng thái đang chọn
      return (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
          // Áp dụng màu xanh nếu đang active, ngược lại để màu xám
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${isActive
              ? "bg-green-50 text-green-600 font-bold border-r-4 border-green-500 rounded-r-none"
              : "text-gray-600 hover:bg-gray-50 hover:text-green-500"
            }`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="text-sm">{item.label}</span>
        </button>
      );
    });

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0 sticky top-0 h-screen shadow-sm">
      {/* PHẦN ĐẦU SIDEBAR (ĐÃ LƯỢC BỎ LOGO) */}
      <div className="p-4 border-b border-gray-100">
      </div>

      {/* VÙNG CHỨA CÁC NHÓM MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Nhóm Menu Chính */}
        <div className="mb-6">
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 opacity-70">
            HỆ THỐNG
          </p>
          {renderMenuItems(mainMenuItems)}
        </div>

        {/* Nhóm Menu Hoạt động */}
        <div>
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 opacity-70">
            DỊCH VỤ
          </p>
          {renderMenuItems(activityMenuItems)}
        </div>
      </nav>

      {/* PHẦN CHÂN SIDEBAR (Tùy chọn hiển thị phiên bản hoặc hỗ trợ) */}
      <div className="p-4 border-t border-gray-100 italic text-[10px] text-gray-400 text-center">
        v1.0.0 - Green Tech Team
      </div>
    </div>
  );
};

export default Sidebar;
