// Nhập axiosClient để lấy dữ liệu từ server
import axiosClient from "./axiosClient";

/**
 * Lấy danh sách xếp hạng của người dân dựa trên tổng số điểm tích lũy
 */
export const getCitizenRankings = async () => {
  try {
    // Gửi yêu cầu GET lấy danh sách toàn bộ Citizen
    const response = await axiosClient.get("/Citizen");
    
    // Nếu dữ liệu hợp lệ
    if (response.data && response.data.success) {
      // Sắp xếp danh sách người dân theo điểm số giảm dần (từ cao đến thấp)
      // (b.totalPoints || 0) - (a.totalPoints || 0)
      const sorted = response.data.data.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      return { success: true, data: sorted };
    }
    // Trả về kết quả thất bại nếu dữ liệu không đúng cấu trúc
    return { success: false, message: "Không thể lấy dữ liệu xếp hạng" };
  } catch (error) {
    // Log lỗi để kiểm tra hệ thống
    console.error("Error fetching rankings:", error);
    throw error;
  }
};
