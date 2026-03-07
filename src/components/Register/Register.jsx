import { useState } from "react";
import { Lock, Phone, User, Eye, EyeOff, Check, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError("Vui lòng điền đầy đủ tất cả các trường");
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
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

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                100+
              </div>
              <p className="text-sm text-white/70">Khu vực thu gom</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                50K+
              </div>
              <p className="text-sm text-white/70">Người tham gia</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                10K+
              </div>
              <p className="text-sm text-white/70">Quà tặng đã trao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
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

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-3">
              <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">
                  Đăng ký thành công!
                </p>
                <p className="text-sm text-emerald-700">Đang chuyển hướng...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-emerald-500 text-white font-medium py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 pt-4">
              Bạn đã có tài khoản?{" "}
              <a
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Đăng nhập ngay
              </a>
            </p>

            {/* Privacy Notice */}
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
        </div>
      </div>
    </div>
  );
}

export default Register;
