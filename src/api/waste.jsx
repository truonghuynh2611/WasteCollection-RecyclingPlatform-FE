import axiosClient from "./axiosClient";

export const getPendingReportsForAdmin = async () => {
    const response = await axiosClient.get("/WasteReport/admin/pending");
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || "Lỗi khi lấy danh sách báo cáo chờ xử lý");
};

export const createWasteReport = async (reportData) => {
  const response = await axiosClient.post("/WasteReport", reportData);
  return response.data;
};

export const getWasteReports = async () => {
  const response = await axiosClient.get("/WasteReport");
  return response.data;
};

export const getWasteReportsByCitizen = async (citizenId) => {
  const response = await axiosClient.get(`/WasteReport/citizen/${citizenId}`);
  return response.data;
};

export const deleteWasteReport = async (reportId) => {
  const response = await axiosClient.delete(`/WasteReport/${reportId}`);
  return response.data;
};

export const updateWasteReport = async (reportId, updateData) => {
  const response = await axiosClient.put(`/WasteReport/${reportId}`, updateData);
  return response.data;
};
