// Nhập các hook từ React
import { useState } from "react";
// Nhập hook điều hướng và link từ react-router-dom
import { useNavigate, Link, Navigate } from "react-router-dom";
// Nhập các icon trang trí và minh họa trạng thái từ thư viện lucide-react
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";
// Nhập context quản lý xác thực và danh sách Role
import { useAuth, ROLES } from "../../contexts/AuthContext";
// Nhập hàm gọi API đăng nhập
import { loginUser } from "../../api/auth";

function Login() {
  const navigate = useNavigate();
  // Lấy các hàm và biến từ AuthContext
  const { login: setAuthUser, isAuthenticated, user } = useAuth();

  // State lưu trữ thông tin nhập liệu từ form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  // State quản lý trạng thái đang gửi yêu cầu đăng nhập
  const [loading, setLoading] = useState(false);
  // State lưu thông báo lỗi hiển thị lên giao diện
  const [error, setError] = useState("");

  /**
   * TỰ ĐỘNG ĐIỀU HƯỚNG NẾU ĐÃ ĐĂNG NHẬP
   * Nếu người dùng đã vào trang Login mà trạng thái isAuthenticated là true,
   * hệ thống sẽ tự động đẩy về trang tương ứng với Role của họ.
   */
  if (isAuthenticated && user) {
    if (user.role === ROLES.ADMIN || user.role === "r1") return <Navigate to="/admin" replace />;
    if (user.role === ROLES.COLLECTOR || user.role === "r2") return <Navigate to="/collector" replace />;
    if (user.role === ROLES.AREA_MANAGER || user.role === "r5") return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }

  /**
   * Cập nhật State khi người dùng gõ phím vào các ô input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Xử lý khi nhấn nút Đăng nhập
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Chặn việc trình duyệt tải lại trang
    setError(""); // Xóa lỗi cũ

    // Kiểm tra tính hợp lệ cơ bản của dữ liệu
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Vui lòng điền email và mật khẩu");
      return;
    }

    // Kiểm tra định dạng email bằng Regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Định dạng email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng nhập và nhận về dữ liệu xác thực (token, role, user info)
      const authData = await loginUser(
        formData.email.trim(),
        formData.password.trim(),
      );

      /**
       * PHÂN LUỒNG ĐIỀU HƯỚNG DỰA TRÊN ROLE
       * Kiểm tra role trả về từ server để quyết định trang chuyển đến.
       */
      const role = authData.role || authData.user?.role || "Citizen";
      let target = "/";
      if (role === "Admin" || authData.roleId === "r1") {
        target = "/admin";
      } else if (role === "Collector" || authData.roleId === "r2") {
        target = "/collector";
      } else if (role === "Manager" || authData.roleId === "r5") {
        target = "/manager";
      } else {
        target = "/"; // Trang chủ dành cho Người dân (Citizen)
      }

      // Lưu thông tin đăng nhập vào Context (và localStorage)
      setAuthUser(authData);
      // Chuyển hướng người dùng sang trang mục tiêu
      navigate(target, { replace: true });
    } catch (err) {
      // Hiển thị thông báo lỗi cụ thể từ API
      setError(err?.message || "Đăng nhập thất bại. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* PHẦN BÊN TRÁI: Banner hình ảnh và giới thiệu (Ẩn trên mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Lớp phủ màu xanh Gradient để làm nổi bật chữ */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/85"></div>

        {/* Logo và tên thương hiệu */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-16">
            <div className="bg-emerald-400 text-emerald-900 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">Waste Management VN</span>
          </div>
        </div>

        {/* Nội dung giới thiệu và thông số thống kê */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Kết nối cộng đồng –
            <br />
            <span className="text-emerald-400">Tái chế tương lai</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md mb-12">
            Nền tảng kết nối trực tiếp giữa người dân và doanh nghiệp thu gom
            rác thải tái chế từ nhân, cùng nhau xây dựng môi trường bền vững.
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">100+</div>
              <p className="text-sm text-white/70">Khu vực thu gom</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">50.000+</div>
              <p className="text-sm text-white/70">Người tham gia</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">10.000+</div>
              <p className="text-sm text-white/70">Quà tặng đã trao</p>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN BÊN PHẢI: Form đăng nhập chính */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập hệ thống</h2>
            <p className="text-gray-600">Dành cho Doanh nghiệp, nhân viên thu gom và người dân</p>
          </div>

          {/* Hiển thị vùng báo lỗi nếu có */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Trường nhập Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email đăng nhập</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Trường nhập Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                  disabled={loading}
                />
                {/* Nút bật/tắt hiển thị mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Nút bấm Gửi form */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-emerald-500 text-white font-medium py-3 rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập →"}
            </button>

            {/* Link chuyển hướng sang trang Đăng ký */}
            <p className="text-center text-sm text-gray-600 pt-4">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Đăng ký tại đây
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
