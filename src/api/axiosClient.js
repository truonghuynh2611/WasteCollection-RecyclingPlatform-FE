// Nhập thư viện axios để thực hiện các yêu cầu HTTP (GET, POST, PUT, DELETE)
import axios from "axios";

// Lấy URL cơ sở của API từ biến môi trường (VITE_API_URL) hoặc mặc định là http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Tạo một instance (thể hiện) của axios với các cấu hình mặc định
const axiosClient = axios.create({
  baseURL: API_URL, // Mọi request sẽ bắt đầu bằng URL này
});

/**
 * Thêm Interceptor cho yêu cầu (Request Interceptor)
 * Mục đích: Tự động đính kèm JWT token vào tiêu đề (header) của mọi yêu cầu gửi đến server
 */
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy thông tin xác thực đã lưu trong localStorage với khóa 'waste_auth_user'
    const storedAuth = localStorage.getItem("waste_auth_user");
    
    if (storedAuth) {
      try {
        // Chuyển đổi dữ liệu từ chuỗi JSON sang đối tượng JavaScript
        const authData = JSON.parse(storedAuth);
        
        // Nếu tồn tại token trong dữ liệu đã lưu
        if (authData?.token) {
          // Thêm Authorization header theo chuẩn Bearer token
          config.headers.Authorization = `Bearer ${authData.token}`;
        }
      } catch (error) {
        // Log lỗi nếu việc parse JSON thất bại
        console.error("Lỗi parse auth_user trong localStorage:", error);
      }
    }
    // Trả về config đã được chỉnh sửa để tiếp tục gửi request
    return config;
  },
  (error) => {
    // Xử lý lỗi nếu có vấn đề xảy ra trước khi request được gửi đi
    return Promise.reject(error);
  }
);

// Xuất axiosClient để sử dụng ở các file gọi API khác
export default axiosClient;
