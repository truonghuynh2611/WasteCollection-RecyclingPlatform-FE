// Nhập axiosClient để thực hiện các yêu cầu liên quan đến báo cáo rác thải
import axiosClient from "./axiosClient";
 
/**
 * Gửi một báo cáo rác mới lên hệ thống
 * @param {FormData} reportData - Thường là đối tượng FormData chứa cả văn bản và hình ảnh
 */
export const createWasteReport = async (reportData) => {
  /**
   * axiosClient sẽ tự động thêm Header Authorization từ localStorage.
   * Khi truyền vào một đối tượng FormData, axios sẽ tự động thiết lập 
   * tiêu đề Content-Type là multipart/form-data cùng với boundary phù hợp.
   */
  const response = await axiosClient.post("/WasteReport", reportData);
  return response.data; // Trả về kết quả xác nhận từ server
};
 
/**
 * Lấy danh sách toàn bộ các báo cáo rác thải có trong hệ thống
 */
export const getWasteReports = async () => {
  // Gửi lệnh GET và trả về mảng dữ liệu báo cáo
  const response = await axiosClient.get("/WasteReport");
  return response.data;
};

/**
 * Lấy danh sách các báo cáo rác thải do một công dân (Citizen) cụ thể đã gửi
 * @param {string|number} citizenId - ID định danh của công dân
 */
export const getWasteReportsByCitizen = async (citizenId) => {
  const response = await axiosClient.get(`/WasteReport/citizen/${citizenId}`);
  return response.data;
};
 
/**
 * Xóa một báo cáo rác khỏi hệ thống (thường chỉ cho phép khi báo cáo đang ở trạng thái 'Chờ xử lý')
 * @param {string|number} reportId - ID của báo cáo cần xóa
 */
export const deleteWasteReport = async (reportId) => {
  const response = await axiosClient.delete(`/WasteReport/${reportId}`);
  return response.data;
};
