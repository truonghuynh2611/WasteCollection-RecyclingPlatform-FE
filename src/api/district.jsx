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
/**
 * Tạo mới một Quận/Huyện
 * @param {Object} data - Dữ liệu quận mới { districtName }
 */
export const createDistrict = async (data) => {
    const response = await axiosClient.post("/District", data);
    return response.data;
};

/**
 * Cập nhật tên Quận/Huyện
 * @param {number} id - ID quận
 * @param {Object} data - Dữ liệu cập nhật { districtName }
 */
export const updateDistrict = async (id, data) => {
    const response = await axiosClient.put(`/District/${id}`, data);
    return response.data;
};

/**
 * Xóa Quận/Huyện
 * @param {number} id - ID quận
 */
export const deleteDistrict = async (id) => {
    const response = await axiosClient.delete(`/District/${id}`);
    return response.data;
};
