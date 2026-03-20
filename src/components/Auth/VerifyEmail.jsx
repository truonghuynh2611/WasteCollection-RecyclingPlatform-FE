// Nhập các hook từ React
import { useState, useEffect } from "react";
// Nhập hook để lấy query params và điều hướng trang từ react-router-dom
import { useSearchParams, useNavigate } from "react-router-dom";
// Nhập các icon từ thư viện lucide-react để minh họa giao diện
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react";
// Nhập các hàm API liên quan đến xác thực
import { verifyEmail, resendVerificationCode } from "../../api/auth";
// Nhập context Auth để thực hiện đăng nhập sau khi xác thực thành công
import { useAuth } from "../../contexts/AuthContext";

function VerifyEmail() {
  // Lấy email từ URL (vd: ?email=abc@gmail.com)
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();
  // Hàm login từ AuthContext để lưu thông tin người dùng vào máy
  const { login } = useAuth();

  // State lưu trữ mã OTP 6 số người dùng nhập vào
  const [code, setCode] = useState("");
  // State quản lý trạng thái của quá trình xác thực (đang chờ, đang gửi, thành công, lỗi)
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  // State lưu thông báo phản hồi từ server
  const [message, setMessage] = useState("");
  // State quản lý trạng thái đang gửi lại mã (để hiển thị loading)
  const [resending, setResending] = useState(false);
  // State đếm ngược thời gian để cho phép gửi lại mã tiếp theo
  const [countdown, setCountdown] = useState(0);

  // Effect xử lý đồng hồ đếm ngược (countdown)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    // Dọn dẹp timer khi component bị hủy hoặc countdown thay đổi
    return () => clearInterval(timer);
  }, [countdown]);

  /**
   * Hàm xử lý khi người dùng nhấn nút "Xác thực ngay"
   */
  const handleVerify = async (e) => {
    if (e) e.preventDefault(); // Ngăn trình duyệt load lại trang
    
    // Kiểm tra độ dài mã OTP
    if (code.length !== 6) {
      setStatus("error");
      setMessage("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    setStatus("verifying"); // Hiển thị trạng thái đang xử lý
    try {
      // Gọi API gửi mã xác thực lên server
      const authData = await verifyEmail(emailParam, code);
      setStatus("success");
      setMessage("Xác thực email thành công! Đang chuẩn bị đăng nhập...");
      
      // Nếu server trả về thông tin đăng nhập kèm theo (token, user)
      if (authData) {
        login(authData); // Thực hiện lưu trạng thái đăng nhập
      }

      // Sau 2 giây tự động chuyển về trang chủ
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (err) {
      setStatus("error");
      // Hiển thị thông báo lỗi từ server hoặc lỗi mặc định
      setMessage(err.message || "Xác thực thất bại. Vui lòng kiểm tra lại mã.");
    }
  };

  /**
   * Hàm xử lý khi người dùng yêu cầu gửi lại mã OTP mới
   */
  const handleResend = async () => {
    // Nếu đang trong thời gian chờ hoặc đang gửi thì không cho phép nhấn tiếp
    if (countdown > 0 || resending) return;
    
    setResending(true);
    try {
      // Gọi API yêu cầu server tạo mã mới và gửi email
      await resendVerificationCode(emailParam);
      setCountdown(60); // Bắt đầu đếm ngược 60 giây
      setStatus("idle");
      setMessage("Mã mới đã được gửi đến email của bạn.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Gửi lại mã thất bại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Đường kẻ trang trí phía trên */}
        <div className="h-2 bg-emerald-500 w-full"></div>
        
        <div className="p-8">
          {/* Vùng hiển thị Icon trạng thái */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${
              status === "success" ? "bg-emerald-50" : 
              status === "error" ? "bg-red-50" : "bg-emerald-50"
            }`}>
              {/* Hiển thị icon tương ứng với từng trạng thái */}
              {status === "verifying" ? (
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              ) : status === "error" ? (
                <XCircle className="h-10 w-10 text-red-500" />
              ) : (
                <Mail className="h-10 w-10 text-emerald-500" />
              )}
            </div>
          </div>

          {/* Tiêu đề và hướng dẫn */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Xác thực tài khoản</h2>
            <p className="text-sm text-gray-500 mt-2">
              Chúng tôi đã gửi mã 6 số đến <br/>
              <span className="font-semibold text-gray-700">{emailParam}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* Vùng nhập mã OTP */}
            <div className="flex flex-col items-center">
              <input
                type="text"
                maxLength="6"
                value={code}
                // Chỉ cho phép nhập số
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                // Định dạng input số to, giãn cách rộng để dễ nhìn
                className="w-full text-center text-4xl font-bold tracking-[1em] pl-[0.5em] py-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-gray-200"
                disabled={status === "verifying" || status === "success"}
                autoFocus
              />
            </div>

            {/* Hiển thị thông báo phản hồi người dùng */}
            {message && (
              <p className={`text-sm text-center ${status === "error" ? "text-red-500" : "text-emerald-600"}`}>
                {message}
              </p>
            )}

            {/* Nút bấm xác nhận */}
            <button
              type="submit"
              disabled={status === "verifying" || status === "success" || code.length !== 6}
              className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:shadow-emerald-300 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center space-x-2"
            >
              {status === "verifying" ? (
                <Loader2 className="h-5 w-5 animate-spin" /> // Hiển thị xoay xoay khi đang chờ
              ) : (
                <>
                  <span>Xác thực ngay</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Phần chân trang: Gửi lại mã */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">Bạn vẫn chưa nhận được mã?</p>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending || status === "success"}
              className="inline-flex items-center space-x-2 text-emerald-600 font-bold hover:text-emerald-700 disabled:text-gray-400 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
              <span>
                {/* Hiển thị thời gian chờ nếu đang đếm ngược */}
                {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : "Gửi lại mã xác thực"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
