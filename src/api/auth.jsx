// Nhập axiosClient để thực hiện các yêu cầu HTTP xác thực
import axiosClient from "./axiosClient";

/**
 * API ĐĂNG KÝ (REGISTER)
 * Gửi thông tin người dùng mới lên server để tạo tài khoản
 * @param {Object} userData - Chứa fullName, email, phone, password
 */
export const registerUser = async (userData) => {
  try {
    // Gọi API POST /Auth/register với dữ liệu người dùng
    const response = await axiosClient.post("/Auth/register", {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: 0, // Gán vai trò mặc định là 0 (Citizen - Người dân)
    });
    return response.data; // Trả về kết quả từ server (thành công hoặc thông báo)
  } catch (error) {
    // Ném ra thông báo lỗi chi tiết từ server hoặc thông báo mặc định
    throw new Error(
      error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!"
    );
  }
};

/**
 * API XÁC THỰC EMAIL (VERIFY EMAIL)
 * Xác nhận tài khoản thông qua mã số được gửi về email
 * @param {string} email - Email cần xác nhận
 * @param {string} code - Mã xác nhận gồm 6 chữ số
 */
export const verifyEmail = async (email, code) => {
  try {
    // Gửi yêu cầu POST kèm email và mã code
    const response = await axiosClient.post("/Auth/verify-email", { email, code });
    
    // Nếu có dữ liệu trong trường data, trả về dữ liệu đó
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    // Xử lý và ném lỗi nếu xác thực không thành công
    throw new Error(
      error.response?.data?.message || "Xác thực email thất bại!"
    );
  }
};

/**
 * API GỬI LẠI MÃ XÁC THỰC (RESEND CODE)
 * Yêu cầu server gửi lại mã OTP mới về email người dùng
 * @param {string} email - Email nhận mã xác thực
 */
export const resendVerificationCode = async (email) => {
  try {
    // Gọi API gửi lại mã
    const response = await axiosClient.post("/Auth/resend-code", { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Gửi lại mã thất bại!"
    );
  }
};

/**
 * API ĐĂNG NHẬP (LOGIN)
 * Xác thực tài khoản và nhận về Token JWT cùng thông tin cá nhân
 * @param {string} email - Địa chỉ email đăng nhập
 * @param {string} password - Mật khẩu đăng nhập
 */
export const loginUser = async (email, password) => {
  try {
    // Gửi yêu cầu POST đăng nhập, xử lý xóa khoảng trắng dư thừa
    const response = await axiosClient.post("/Auth/login", {
      email: String(email).trim(),
      password: String(password).trim(),
    });
    
    // ApiResponse thường có cấu trúc: { success: boolean, data: { token, user }, message: string }
    if (response.data && response.data.data) {
      // Trả về payload chứa token JWT và thông tin cơ bản của user (id, email, role)
      return response.data.data;
    }
    // Nếu không có trường data, coi như dữ liệu từ server trả về không đúng kỳ vọng
    throw new Error("Dữ liệu trả về không hợp lệ từ server.");
  } catch (error) {
    // Lấy thông báo lỗi cụ thể từ server nếu có, không thì dùng câu thông báo lỗi mặc định
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Tài khoản hoặc mật khẩu không chính xác!";
    throw new Error(msg);
  }
};
