import axiosClient from "./axiosClient";

// Hàm gửi báo cáo rác mới
export const createWasteReport = async (reportData) => {
  // axiosClient sẽ tự động thêm Authorization header
  // Khi gửi FormData, axios sẽ tự động set Content-Type là multipart/form-data
  const response = await axiosClient.post("/WasteReport", reportData);
  return response.data;
};

// Hàm lấy danh sách báo cáo rác
export const getWasteReports = async () => {
  const response = await axiosClient.get("/WasteReport");
  return response.data;
};
