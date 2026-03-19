import axiosClient from "./axiosClient";

// --- API ĐĂNG KÝ (REGISTER) ---
export const registerUser = async (userData) => {
  try {
    const response = await axiosClient.post("/Auth/register", {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: 0, // 0 là Citizen (mặc định theo yêu cầu)
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!"
    );
  }
};

// --- API XÁC THỰC EMAIL (VERIFY EMAIL) ---
export const verifyEmail = async (email, code) => {
  try {
    const response = await axiosClient.post("/Auth/verify-email", { email, code });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Xác thực email thất bại!"
    );
  }
};

// --- API GỬI LẠI MÃ XÁC THỰC (RESEND CODE) ---
export const resendVerificationCode = async (email) => {
  try {
    const response = await axiosClient.post("/Auth/resend-code", { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Gửi lại mã thất bại!"
    );
  }
};

// --- API ĐĂNG NHẬP (LOGIN) ---
export const loginUser = async (email, password) => {
  try {
    const response = await axiosClient.post("/Auth/login", {
      email: String(email).trim(),
      password: String(password).trim(),
    });
    
    // ApiResponse format thường là { success, data, message }
    // Với data chứa { token, user: { id, email, role... } }
    if (response.data && response.data.data) {
      return response.data.data; // Trả về payload chứa token và thông tin user
    }
    throw new Error("Dữ liệu trả về không hợp lệ từ server.");
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Tài khoản hoặc mật khẩu không chính xác!";
    throw new Error(msg);
  }
};
