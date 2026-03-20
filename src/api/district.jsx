// Nhập axiosClient để thực hiện các yêu cầu API liên quan đến Quận/Huyện
import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả các Quận/Huyện trong hệ thống
 * Trả về: Dữ liệu từ server (thường là danh sách các đối tượng District)
 */
export const getAllDistricts = async () => {
    try {
        // Gửi yêu cầu GET đến endpoint /District
        const response = await axiosClient.get("/District");
        return response.data;
    } catch (error) {
        // Log lỗi nếu không thể lấy danh sách Quận/Huyện
        console.error("Error fetching districts:", error);
        throw error;
    }
};

/**
 * Lấy thông tin chi tiết của một Quận/Huyện cụ thể theo ID
 * @param {string|number} id - ID của Quận/Huyện cần lấy thông tin
 */
export const getDistrictDetails = async (id) => {
    try {
        // Gửi yêu cầu GET kèm theo ID của Quận/Huyện
        const response = await axiosClient.get(`/District/${id}`);
        return response.data;
    } catch (error) {
        // Log lỗi kèm theo ID để dễ dàng kiểm tra
        console.error(`Error fetching district ${id}:`, error);
        throw error;
    }
};
