// Nhập các hook từ React
import { useState } from "react";
// Nhập các icon trang trí từ thư viện lucide-react
import { Lock, Phone, User, Eye, EyeOff, Check, Mail } from "lucide-react";
// Nhập hook điều hướng trang từ react-router-dom
import { useNavigate, Navigate } from "react-router-dom";
// Nhập hàm gọi API đăng ký tài khoản
import { registerUser } from "../../api/auth";
// Nhập context quản lý xác thực và danh sách Role
import { useAuth, ROLES } from "../../contexts/AuthContext";

function Register() {
  const navigate = useNavigate();
  // Lấy trạng thái đăng nhập từ Context
  const { login: setAuthUser, isAuthenticated, user } = useAuth();

  /**
   * TỰ ĐỘNG ĐIỀU HƯỚNG NẾU ĐÃ ĐĂNG NHẬP
   * Ngăn người dùng đã đăng nhập truy cập lại trang đăng ký
   */
  if (isAuthenticated && user) {
    if (user.role === ROLES.ADMIN || user.role === "r1") return <Navigate to="/admin" replace />;
    if (user.role === ROLES.COLLECTOR || user.role === "r2") return <Navigate to="/collector" replace />;
    if (user.role === ROLES.AREA_MANAGER || user.role === "r5") return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }

  // State lưu trữ dữ liệu nhập liệu từ form đăng ký
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  // State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  // State quản lý trạng thái đang gửi yêu cầu lên server
  const [loading, setLoading] = useState(false);
  // State lưu thông báo lỗi
  const [error, setError] = useState("");
  // State đánh dấu việc đăng ký thành công để hiển thị giao diện thông báo
  const [success, setSuccess] = useState(false);

  /**
   * Hàm cập nhật state khi người dùng nhập liệu
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /**
   * Hàm xử lý khi người dùng nhấn nút "Đăng ký ngay"
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Chặn load lại trang
    setError(""); // Xóa lỗi cũ

    // 1. Kiểm tra việc điền đầy đủ thông tin
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError("Vui lòng điền đầy đủ tất cả các trường");
      return;
    }

    // 2. Kiểm tra định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Số điện thoại phải bắt đầu bằng số 0 và bao gồm đúng 10 chữ số");
      return;
    }

    // 3. Kiểm tra độ mạnh của mật khẩu
    // Độ dài từ 6 đến 15 ký tự
    if (formData.password.length < 6 || formData.password.length > 15) {
      setError("Mật khẩu phải dài từ 6 đến 15 ký tự");
      return;
    }
    // Không chứa khoảng trắng
    if (/\s/.test(formData.password)) {
      setError("Mật khẩu không được chứa khoảng trắng");
      return;
    }
    // Phải có chữ hoa, chữ thường và ký tự đặc biệt
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
    if (!pwdRegex.test(formData.password)) {
      setError("Mật khẩu phải bao gồm ít nhất một chữ hoa, một chữ thường và một ký tự đặc biệt");
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký tài khoản (Server sẽ gửi mail OTP)
      await registerUser(formData);
      setSuccess(true); // Hiển thị màn hình thông báo thành công
      
      // Sau 0.5 giây chuyển sang trang nhập mã OTP
      setTimeout(() => {
        navigate(`/verify-email?email=${formData.email}`);
      }, 500);
    } catch (err) {
      // Hiển thị lỗi từ server trả về
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* PHẦN BÊN TRÁI: Banner hình ảnh (Ẩn trên mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/85"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-16">
            <div className="bg-emerald-400 text-emerald-900 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">Green Vietnam</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Kết nối cộng đồng
            <br />
            <span className="text-emerald-400">Tái chế tương lai</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md mb-12">
            Nên tảng kết nối trực tiếp giữa người dân và doanh nghiệp thu gom
            rác thải tái chế từ nhân, cùng nhau xây dựng môi trường bền vững.
          </p>

          {/* Các con số thống kê ấn tượng */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">100+</div>
              <p className="text-sm text-white/70">Khu vực thu gom</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">50K+</div>
              <p className="text-sm text-white/70">Người tham gia</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">10K+</div>
              <p className="text-sm text-white/70">Quà tặng đã trao</p>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN BÊN PHẢI: Form đăng ký */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng ký tài khoản Người dân
            </h2>
            <p className="text-gray-600">
              Tạo tài khoản để tham gia phân loại rác tại nguồn
            </p>
          </div>

          {/* GIAO DIỆN KHI ĐĂNG KÝ THÀNH CÔNG */}
          {success && (
            <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col items-center text-center animate-fadeIn">
              <div className="bg-emerald-100 p-3 rounded-full mb-4">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Đăng ký thành công!</h3>
              <p className="text-emerald-700 mb-4">
                Chúng tôi đã gửi một email xác thực đến địa chỉ <strong>{formData.email}</strong>.
              </p>
              <p className="text-sm text-emerald-600 bg-white p-3 rounded border border-emerald-100 italic shadow-sm">
                Vui lòng kiểm tra hộp thư (bao gồm cả thư rác) để lấy mã xác thực 6 số và kích hoạt tài khoản.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-6 text-emerald-600 font-medium hover:underline"
              >
                Quay lại trang đăng nhập
              </button>
            </div>
          )}

          {/* Hiển thị thông báo lỗi */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* HIỂN THỊ FORM Đăng ký nếu chưa thành công */}
          {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nhập Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Nhập Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Nhập Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912 345 678"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Nhập Mật khẩu */}
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
                {/* Nút ẩn hiện mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Chú thích yêu cầu mật khẩu */}
              <p className="mt-1 text-[10px] text-gray-500 italic">
                * Mật khẩu dài từ 6 đến 15 ký tự, bao gồm chữ hoa, chữ thường và ít nhất một ký tự đặc biệt, không có khoảng trắng.
              </p>
            </div>

            {/* Nút gửi form đăng ký */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-emerald-500 text-white font-medium py-3 rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>

            {/* Link quay lại trang đăng nhập */}
            <p className="text-center text-sm text-gray-600 pt-4">
              Bạn đã có tài khoản?{" "}
              <a
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Đăng nhập ngay
              </a>
            </p>

            {/* Thông báo bảo mật */}
            <p className="text-center text-xs text-gray-500 pt-2 flex items-center justify-center space-x-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Bảo mật & An toàn thông tin</span>
            </p>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
