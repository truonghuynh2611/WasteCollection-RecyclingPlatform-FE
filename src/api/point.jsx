// Nhập axiosClient để thực hiện các yêu cầu API liên quan đến điểm thưởng
import axiosClient from "./axiosClient";
 
/**
 * 1. Lấy danh sách quy tắc cộng điểm (vd: rác nhựa bao nhiêu điểm/kg)
 * Trả về: Danh sách các quy tắc điểm
 */
export const getPointRules = async () => {
  try {
    // Gửi yêu cầu GET lấy thông tin các quy tắc tính điểm
    const response = await axiosClient.get("/Point/rules");
    return response.data;
  } catch (error) {
    console.error("Error fetching point rules:", error);
    throw error;
  }
};
 
/**
 * 2. Ghi lại lịch sử giao dịch điểm (khi người dân nhận được điểm)
 * @param {Object} transactionData - Dữ liệu giao dịch điểm
 * Lưu ý quan trọng: Trong hệ thống .NET hiện tại, việc cộng điểm thường được 
 * tự động xử lý bởi Backend sau khi nhân viên đã xác nhận thu gom thành công.
 * Hàm này hiện tại mang tính chất tương thích hoặc để mở rộng sau này.
 */
export const createPointTransaction = async (transactionData) => {
  // Giả lập trả về thành công vì logic thực tế nằm ở phía Server
  return { success: true };
};
 
/**
 * 3. Lấy lịch sử nhận điểm/giao dịch điểm của một người dùng cụ thể
 * @param {string|number} userId - ID của người dùng (có thể là CitizenId)
 */
export const getMyPointHistory = async (userId) => {
  try {
    // Gửi yêu cầu GET lấy lịch sử điểm của công dân theo ID tương ứng
    const response = await axiosClient.get(`/PointHistory/citizen/${userId}`);
    
    // Nếu yêu cầu thành công và có dữ liệu trả về
    if (response.data && response.data.success) {
      /**
       * Ánh xạ (Map) dữ liệu từ Backend trả về sang định dạng mà Frontend mong đợi
       * BE trả về: pointAmount, createdAt
       * FE cần: points, created_at
       */
      return response.data.data.map(item => ({
        ...item,
        points: item.pointAmount, // Gán pointAmount vào points
        created_at: item.createdAt, // Gán createdAt vào created_at
        action: item.action        // Giữ nguyên trường action (vd: 'Earned' hoặc 'Spent')
      }));
    }
    return []; // Trả về mảng rỗng nếu không có dữ liệu
  } catch (error) {
    console.error("Error fetching point history:", error);
    throw error;
  }
};
