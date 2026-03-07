import axiosClient from "./axiosClient";

// --- API ĐĂNG KÝ (REGISTER) ---
export const registerUser = async (userData) => {
  try {
    const response = await axiosClient.post("/Auth/register", {
      fullName: userData.fullName,
      email: userData.email, // backend yêu cầu email
      phone: userData.phone,
      password: userData.password,
      role: 3, // Thường 3 là Citizen
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!"
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
