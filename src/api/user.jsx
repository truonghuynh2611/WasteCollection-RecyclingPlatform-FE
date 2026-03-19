import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả công dân (quản trị viên)
 */
export const getAllCitizens = async () => {
    try {
        const response = await axiosClient.get("/Citizen");
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching citizens:", error);
        throw error;
    }
};

/**
 * Lấy thống kê về công dân
 */
export const getCitizenStats = async () => {
    try {
        const response = await axiosClient.get("/Citizen/stats");
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching citizen stats:", error);
        throw error;
    }
};
