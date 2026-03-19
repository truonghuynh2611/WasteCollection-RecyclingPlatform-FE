import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react";
import { verifyEmail, resendVerificationCode } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { login } = useAuth();

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      setStatus("error");
      setMessage("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    setStatus("verifying");
    try {
      const authData = await verifyEmail(emailParam, code);
      setStatus("success");
      setMessage("Xác thực email thành công! Đang chuẩn bị đăng nhập...");
      
      if (authData) {
        login(authData);
      }

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Xác thực thất bại. Vui lòng kiểm tra lại mã.");
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    
    setResending(true);
    try {
      await resendVerificationCode(emailParam);
      setCountdown(60);
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
        {/* Header Decor */}
        <div className="h-2 bg-emerald-500 w-full"></div>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${
              status === "success" ? "bg-emerald-50" : 
              status === "error" ? "bg-red-50" : "bg-emerald-50"
            }`}>
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

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Xác thực tài khoản</h2>
            <p className="text-sm text-gray-500 mt-2">
              Chúng tôi đã gửi mã 6 số đến <br/>
              <span className="font-semibold text-gray-700">{emailParam}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex flex-col items-center">
              <input
                type="text"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="w-full text-center text-4xl font-bold tracking-[1em] pl-[0.5em] py-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-gray-200"
                disabled={status === "verifying" || status === "success"}
                autoFocus
              />
            </div>

            {message && (
              <p className={`text-sm text-center ${status === "error" ? "text-red-500" : "text-emerald-600"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "verifying" || status === "success" || code.length !== 6}
              className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:shadow-emerald-300 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center space-x-2"
            >
              {status === "verifying" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Xác thực ngay</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">Bạn vẫn chưa nhận được mã?</p>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending || status === "success"}
              className="inline-flex items-center space-x-2 text-emerald-600 font-bold hover:text-emerald-700 disabled:text-gray-400 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
              <span>
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
