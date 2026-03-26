import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả các Team
 */
export const getAllTeams = async () => {
    const response = await axiosClient.get("/Team");
    return response.data;
};

/**
 * Lấy danh sách tất cả Collector
 */
export const getAllCollectors = async () => {
    const response = await axiosClient.get("/Team/collectors");
    return response.data;
};

/**
 * Lấy chi tiết Team theo ID
 */
export const getTeamById = async (id) => {
    const response = await axiosClient.get(`/Team/${id}`);
    return response.data;
};

/**
 * Tạo Team mới
 */
export const createTeam = async (data) => {
    const response = await axiosClient.post("/Team", data);
    return response.data;
};

/**
 * Cập nhật thông tin Team
 */
export const updateTeam = async (id, data) => {
    const response = await axiosClient.put(`/Team/${id}`, data);
    return response.data;
};

/**
 * Xóa Team
 */
export const deleteTeam = async (id) => {
    const response = await axiosClient.delete(`/Team/${id}`);
    return response.data;
};

/**
 * Admin tạo Collector mới và gán vào Team
 * data: { fullName, email, password, phone, teamId, role }
 */
export const createCollector = async (data) => {
    const response = await axiosClient.post("/Team/create-collector", data);
    return response.data;
};

/**
 * Lấy danh sách Collector của một Team
 */
export const getCollectorsByTeam = async (teamId) => {
    const response = await axiosClient.get(`/Team/${teamId}/collectors`);
    return response.data;
};

/**
 * Thiết lập Trưởng nhóm (Leader)
 */
export const setLeader = async (teamId, collectorId) => {
    const response = await axiosClient.post(`/Team/${teamId}/set-leader/${collectorId}`);
    return response.data;
};

/**
 * Gỡ chức vụ Trưởng nhóm
 */
export const removeLeader = async (teamId, collectorId) => {
    const response = await axiosClient.post(`/Team/${teamId}/remove-leader/${collectorId}`);
    return response.data;
};

/**
 * Thêm Collector hiện có vào Team
 */
export const addCollectorToTeam = async (data) => {
    const response = await axiosClient.post("/Team/add-collector", data);
    return response.data;
};

/**
 * Gỡ Collector khỏi Team
 */
export const removeCollectorFromTeam = async (data) => {
    const response = await axiosClient.delete("/Team/collector", { data });
    return response.data;
};

/**
 * Chỉ định Đội quản lý Khu vực
 */
export const assignTeamToArea = async (teamId, areaId) => {
    const response = await axiosClient.post(`/Team/${teamId}/assign-area/${areaId}`);
    return response.data;
};

/**
 * Gán báo cáo cho Team
 */
export const assignReportToTeam = async (assignmentData) => {
  const response = await axiosClient.post("/Team/assign-report", assignmentData);
  return response.data;
};

/**
 * Khóa/Mở Khóa tài khoản Collector
 */
export const toggleCollectorStatus = async (collectorId) => {
  const response = await axiosClient.patch(`/Team/collector/${collectorId}/toggle-status`);
  return response.data;
};
