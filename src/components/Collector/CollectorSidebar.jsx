// Nhập các hook từ React Router
import { NavLink, useNavigate } from "react-router-dom";
// Nhập các icon từ thư viện lucide-react
import { LayoutDashboard, ClipboardList, Calendar, LogOut, User } from "lucide-react";
// Nhập context xác thực để lấy thông tin người dùng và hàm đăng xuất
import { useAuth } from "../../contexts/AuthContext";

/**
 * COMPONENT SIDEBAR DÀNH CHO COLLECTOR
 * Chứa thông tin người dùng và các liên kết điều hướng chính
 */
export default function CollectorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Xử lý sự kiện đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * DANH SÁCH CÁC MỤC MENU TRÊN SIDEBAR
   */
  const menuItems = [
    { path: "/collector", icon: LayoutDashboard, label: "Bảng điều khiển" },
    { path: "/collector/tasks", icon: ClipboardList, label: "Nhiệm vụ" },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0">
      {/* DANH SÁCH LIÊN KẾT ĐIỀU HƯỚNG - Gọn nhẹ, thanh thoát */}
      <nav className="flex-1 px-4 space-y-2 mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            // Định nghĩa style khi link đang được chọn (active)
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100 font-bold scale-[1.02]"
                  : "text-gray-400 hover:bg-gray-50 hover:text-emerald-600"
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-sm uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
