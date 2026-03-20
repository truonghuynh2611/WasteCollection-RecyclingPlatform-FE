// Nhập axiosClient để thực hiện các yêu cầu API liên quan đến nhiệm vụ thu gom
import axiosClient from "./axiosClient";
 
/**
 * --- DÀNH CHO ADMIN ---
 * Phân công một báo cáo rác cho nhân viên thu gom (Collector)
 * @param {Object} assignmentData - Dữ liệu phân công (vd: reportId, collectorId)
 */
export const assignTask = async (assignmentData) => {
  try {
    // Gửi yêu cầu POST tạo mới một phân công nhiệm vụ
    const response = await axiosClient.post("/ReportAssignment", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw error;
  }
};
 
/**
 * --- DÀNH CHO COLLECTOR (Nhân viên thu gom) ---
 * Lấy danh sách nhiệm vụ được giao cho nhân viên đang đăng nhập
 * BE sẽ dựa trên ID/TeamId của người dùng từ Token JWT để lọc
 */
export const getMyTasks = async () => {
  try {
    // Gửi yêu cầu GET lấy danh sách nhiệm vụ
    const response = await axiosClient.get("/Collector/tasks");
    if (response.data && response.data.success) {
      return response.data.data; // Trả về danh sách nhiệm vụ
    }
    return []; // Trả về mảng rỗng nếu không có dữ liệu
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};
 
/**
 * Cập nhật trạng thái của một nhiệm vụ (vd: Chờ xử lý -> Đang làm -> Hoàn thành)
 * @param {string|number} taskId - ID của nhiệm vụ cần cập nhật
 * @param {string} status - Trạng thái mới (vd: 'InProgress', 'Completed')
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    /**
     * Truyền status dưới dạng chuỗi thô (JSON string) cho API
     * Một số BE yêu cầu nhận giá trị đơn lẻ kiểu string thay vì object
     */
    const response = await axiosClient.patch(`/Collector/tasks/${taskId}/status`, JSON.stringify(status), {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};
 
/**
 * Xác nhận đã hoàn tất việc thu gom tại điểm báo cáo rác
 * @param {string|number} reportId - ID của báo cáo rác
 * @param {FormData|Object} data - Thông tin xác nhận (có thể kèm ảnh thực tế và tọa độ)
 */
export const confirmCollection = async (reportId, data) => {
  try {
    // Gửi yêu cầu POST để hệ thống xác nhận hoàn thành báo cáo và cộng điểm cho người dân
    const response = await axiosClient.post(`/WasteReport/${reportId}/confirm`, data);
    return response.data;
  } catch (error) {
    console.error("Error confirming collection:", error);
    throw error;
  }
};

/**
 * --- ĐÓNG GÓI SERVICE ---
 * Xuất khẩu một đối tượng chứa tất cả các hàm liên quan đến nhiệm vụ
 * Giúp việc import và sử dụng trong các component dễ dàng và đồng bộ hơn
 */
export const taskService = {
  assignTask,
  getCollectorTasks: getMyTasks, // Ánh xạ getMyTasks vào tên getCollectorTasks cho đồng bộ
  updateTaskStatus,
  confirmCollection
};
