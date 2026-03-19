import { LogOut, User, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, ROLES } from "../../contexts/AuthContext";
import logo from "../../assets/images/logo.png";
import NotificationDropdown from "../common/NotificationDropdown";

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Điều hướng trang chủ theo role
  const homePath = isAuthenticated
    ? user?.role === ROLES.ADMIN
      ? "/admin"
      : "/"
    : "/";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to={homePath}>
              <img src={logo} alt="Green Vietnam Logo" className="h-10 w-10 object-contain" />
            </Link>
            <Link to={homePath} className="text-xl font-bold text-gray-900">
              Green Vietnam
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to={homePath}
              className="text-gray-900 font-medium hover:text-green-500 transition"
            >
              Trang chủ
            </Link>
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
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <div className="h-5 w-px bg-gray-300"></div>
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 text-sm hover:opacity-80 transition"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {user?.fullName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                    {user?.roleName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-500 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden text-gray-600"
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
