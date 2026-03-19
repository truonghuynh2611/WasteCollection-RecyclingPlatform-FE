import axiosClient from "./axiosClient";

// --- DÀNH CHO ADMIN ---
// 1. Phân công một báo cáo rác cho nhân viên thu gom
export const assignTask = async (assignmentData) => {
  try {
    const response = await axiosClient.post("/ReportAssignment", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw error;
  }
};

// --- DÀNH CHO COLLECTOR (Nhân viên thu gom) ---
// 2. Lấy danh sách nhiệm vụ của nhân viên thu gom (dựa trên TeamId của họ)
export const getMyTasks = async () => {
  try {
    const response = await axiosClient.get("/Collector/tasks");
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// 3. Cập nhật trạng thái nhiệm vụ (Chờ xử lý, Đang làm, Hoàn thành)
export const updateTaskStatus = async (taskId, status) => {
  try {
    // Truyền status dưới dạng chuỗi thô (JSON string) cho API
    const response = await axiosClient.patch(`/Collector/tasks/${taskId}/status`, JSON.stringify(status), {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// 4. Xác nhận đã thu gom (có thể kèm ảnh và tọa độ)
export const confirmCollection = async (reportId, data) => {
  try {
    const response = await axiosClient.post(`/WasteReport/${reportId}/confirm`, data);
    return response.data;
  } catch (error) {
    console.error("Error confirming collection:", error);
    throw error;
  }
};
