import axiosClient from "./axiosClient";
 
// 1. Lấy danh sách quy tắc cộng điểm
export const getPointRules = async () => {
  try {
    const response = await axiosClient.get("/Point/rules");
    return response.data;
  } catch (error) {
    console.error("Error fetching point rules:", error);
    throw error;
  }
};
 
// 2. Ghi lại lịch sử giao dịch điểm (khi người dân nhận được điểm)
// Lưu ý: Trong .NET BE, việc này thường do Backend tự xử lý khi report hoàn thành.
// Hàm này có thể để lại cho tương thích FE hoặc xóa nếu BE đã lo.
export const createPointTransaction = async (transactionData) => {
  // Mocking for compatibility if needed, but real logic is in BE.
  return { success: true };
};
 
// 3. Lấy lịch sử nhận điểm của một người dùng cụ thể
export const getMyPointHistory = async (userId) => {
  try {
    // userId ở đây có thể là CitizenId hoặc UserId, BE đã xử lý fallback
    const response = await axiosClient.get(`/PointHistory/citizen/${userId}`);
    if (response.data && response.data.success) {
      // Map BE names (pointAmount, createdAt) to FE expected names if needed
      // FE expected: points, created_at, action
      return response.data.data.map(item => ({
        ...item,
        points: item.pointAmount,
        created_at: item.createdAt,
        action: item.action
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching point history:", error);
    throw error;
  }
};
