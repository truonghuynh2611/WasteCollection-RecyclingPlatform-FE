// Nhập axiosClient để thực hiện gọi API người dùng
import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả công dân có trong hệ thống
 * Quyền hạn: Thường dành cho Admin hoặc Quản lý
 */
export const getAllCitizens = async () => {
    try {
        // Gửi yêu cầu GET đến endpoint /Citizen
        const response = await axiosClient.get("/Citizen");
        
        // Trả về danh sách dữ liệu nếu yêu cầu thành công
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
 * Lấy các thông tin thống kê tổng quát về công dân (số lượng, tăng trưởng...)
 */
export const getCitizenStats = async () => {
    try {
        // Gọi API thống kê
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
