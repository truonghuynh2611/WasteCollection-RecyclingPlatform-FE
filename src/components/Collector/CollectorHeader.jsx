// Nhập các icon từ thư viện lucide-react để minh họa chức năng
import { LogOut, User, Bell } from "lucide-react";
// Nhập các component điều hướng từ react-router-dom
import { Link, useNavigate } from "react-router-dom";
// Nhập context xác thực để kiểm tra trạng thái đăng nhập và thông tin người dùng
import { useAuth } from "../../contexts/AuthContext";
// Nhập logo của ứng dụng
import logo from "../../assets/images/logo.png";
// Nhập component con hiển thị thông báo
import NotificationDropdown from "../common/NotificationDropdown";

/**
 * COMPONENT HEADER DÀNH RIÊNG CHO COLLECTOR
 * Tái hiện theo thiết kế yêu cầu: Logo Green Vietnam, Trang chủ, Thông báo, Profile thu gọn và Đăng xuất
 */
export default function CollectorHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Xử lý đăng xuất: Xóa session và đẩy về trang login
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* PHẦN BÊN TRÁI: Logo và Tên thương hiệu "Green Vietnam" */}
          <div className="flex items-center gap-3">
            <Link to="/collector" className="flex items-center gap-3 group">
              <img src={logo} alt="Green Vietnam" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black text-gray-800 tracking-tight">Green Vietnam</span>
            </Link>
          </div>

          {/* PHẦN BÊN PHẢI: Các liên kết và thông tin người dùng */}
          <div className="flex items-center gap-8">
            
            {/* Link quay lại trang chủ (Dashboard của Collector) */}
            <Link 
              to="/collector" 
              className="text-sm font-bold text-gray-800 hover:text-emerald-600 transition-colors"
            >
              Trang chủ
            </Link>

            {/* Component thông báo thông minh */}
            <NotificationDropdown />

            {/* Đường kẻ phân cách dọc tinh tế */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* Thông tin Profile của Collector */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-800 line-clamp-1">{user?.fullName || "Collector Management"}</span>
                    {/* Badge "Collector" nổi bật */}
                    <span className="w-fit px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                      Collector
                    </span>
                  </div>
               </div>

               {/* Nút Đăng xuất dạng Link kèm Icon */}
               <button 
                 onClick={handleLogout}
                 className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all font-bold group ml-4"
               >
                 <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 <span className="text-xs uppercase tracking-widest">Đăng xuất</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
