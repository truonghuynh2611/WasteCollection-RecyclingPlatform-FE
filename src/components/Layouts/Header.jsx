// Nhập các icon từ thư viện lucide-react để minh họa chức năng
import { LogOut, User, Bell } from "lucide-react";
// Nhập các component điều hướng từ react-router-dom
import { Link, useNavigate } from "react-router-dom";
// Nhập context xác thực để kiểm tra trạng thái đăng nhập và thông tin người dùng
import { useAuth, ROLES } from "../../contexts/AuthContext";
// Nhập logo của ứng dụng
import logo from "../../assets/images/logo.png";
// Nhập component con hiển thị thông báo
import NotificationDropdown from "../common/NotificationDropdown";

function Header() {
  // Lấy dữ liệu người dùng, hàm logout và trạng thái xác thực từ AuthContext
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * XÁC ĐỊNH ĐƯỜNG DẪN TRANG CHỦ THEO ROLE
   * Nếu là Admin thì quay về /admin, các role khác quay về trang chủ /
   */
  const homePath = isAuthenticated
    ? user?.role === ROLES.ADMIN
      ? "/admin"
      : "/"
    : "/";

  /**
   * Hàm xử lý đăng xuất người dùng
   */
  const handleLogout = () => {
    logout(); // Xóa token và thông tin user trong máy
    navigate("/", { replace: true }); // Đẩy về trang chủ và xóa lịch sử chuyển trang
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* PHẦN BÊN TRÁI: Logo và Tên thương hiệu */}
          <div className="flex items-center space-x-2">
            <Link to={homePath}>
              <img src={logo} alt="Green Vietnam Logo" className="h-10 w-10 object-contain" />
            </Link>
            <Link to={homePath} className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors">
              Green Vietnam
            </Link>
          </div>

          {/* PHẦN GIỮA: Thanh điều hướng (Chỉ hiện trên máy tính - MD trở lên) */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to={homePath}
              className="text-gray-900 font-medium hover:text-green-500 transition"
            >
              Trang chủ
            </Link>

            {/* CÁC CHỨC NĂNG DÀNH RIÊNG CHO NGƯỜI DÂN (CITIZEN) */}
            {isAuthenticated && user?.role === ROLES.CITIZEN && (
              <>
                <Link
                  to="/report-waste"
                  className="text-gray-900 font-medium hover:text-green-500 transition"
                >
                  Báo cáo rác
                </Link>

                <Link
                  to="/rewards"
                  className="text-gray-900 font-medium hover:text-green-500 transition"
                >
                  Đổi quà
                </Link>
                <Link
                  to="/rankings"
                  className="text-gray-900 font-medium hover:text-green-500 transition"
                >
                  Xếp hạng
                </Link>
              </>
            )}

            {/* PHẦN BÊN PHẢI: Thông báo, Tài khoản và Đăng nhập/Đăng ký */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Component thả xuống hiển thị các thông báo hệ thống */}
                <NotificationDropdown />
                
                <div className="h-5 w-px bg-gray-300"></div> {/* Đường kẻ phân cách dọc */}

                {/* Thông tin người dùng thu nhỏ và link vào Profile */}
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 text-sm hover:opacity-80 transition"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {user?.fullName}
                  </span>
                  {/* Badge hiển thị chức danh (Admin, Người dân, v.v.) */}
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                    {user?.roleName}
                  </span>
                </Link>

                {/* Nút đăng xuất */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              /* HIỂN THỊ KHI CHƯA ĐĂNG NHẬP */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 font-medium hover:text-green-500 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition shadow-md shadow-green-100"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>

          {/* NÚT MENU MOBILE (Hiện trên điện thoại - md hidden) */}
          <button
            className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
            type="button"
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
