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
  ArrowRight,
  Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="min-h-screen bg-[#05110d] flex items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-[1100px] h-[700px] bg-[#0c1d18]/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] flex overflow-hidden">
        
        {/* Left Side: Creative Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-[#05110d]" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">WASTE<span className="text-emerald-400">CONNECT</span></span>
          </motion.div>

          <div className="relative z-10 mt-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-black text-white leading-[1.1] mb-8"
            >
              Vì một Việt Nam <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Xanh, Sạch, Đẹp
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-emerald-100/60 leading-relaxed max-w-sm mb-12"
            >
              Hệ thống quản lý và thu gom rác thải thông minh, kết nối cộng đồng vì môi trường bền vững.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-12"
            >
              {[
                { label: 'Cộng đồng', val: '50k+' },
                { label: 'Khu vực', val: '100+' },
                { label: 'Đội ngũ', val: '200+' }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-white mb-0.5">{stat.val}</p>
                  <p className="text-xs font-medium text-emerald-500/60 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Decorative Image overlay */}
          <div className="absolute bottom-0 right-0 w-full h-full opacity-20 pointer-events-none">
             <img 
               src="https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=1200" 
               className="w-full h-full object-cover"
               alt="Nature"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0c1d18] via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="mb-12">
              <h2 className="text-3xl font-black text-white mb-2">Chào mừng trở lại</h2>
              <p className="text-emerald-100/40 text-sm font-medium italic">Đăng nhập để bắt đầu phiên làm việc mới</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-200 leading-normal">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest ml-1">Email của bạn</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500/30 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 focus:border-emerald-500/50 transition-all placeholder:text-white/10 font-medium"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Mật khẩu</label>
                  <button type="button" className="text-[10px] font-bold text-emerald-400/60 hover:text-emerald-400 uppercase tracking-widest">Quyên mật khẩu?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500/30 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/5 rounded-2xl text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 focus:border-emerald-500/50 transition-all placeholder:text-white/10 font-medium"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-emerald-400 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-10 bg-emerald-500 hover:bg-emerald-400 text-[#0c1d18] font-black py-4 rounded-2xl shadow-[0_12px_40px_-10px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0c1d18]/20 border-t-[#0c1d18] rounded-full animate-spin" />
                ) : (
                  <>ĐĂNG NHẬP <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>

              <p className="text-center text-xs text-white/20 pt-6">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  ĐĂNG KÝ NGAY
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
