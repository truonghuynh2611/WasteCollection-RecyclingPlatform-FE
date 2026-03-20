// Nhập axiosClient để thực hiện các yêu cầu API
import axiosClient from "./axiosClient";

/**
 * Lấy tất cả các cấu hình hệ thống (vd: điềm thưởng, thời gian làm việc...)
 * Trả về: Danh sách cấu hình nếu thành công, mảng rỗng nếu thất bại
 */
export const getAllConfigs = async () => {
    try {
        // Gửi yêu cầu GET lấy cấu hình hệ thống
        const response = await axiosClient.get("/SystemConfiguration");
        
        // Trả về phần data nếu yêu cầu thành công
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        // Log lỗi chi tiết nếu quá trình lấy dữ liệu gặp vấn đề
        console.error("Error fetching configurations:", error);
        throw error;
    }
};

/**
 * Cập nhật giá trị cho một cấu hình hệ thống cụ thể
 * @param {string} key - Tên của cấu hình (vd: 'PointPerKg')
 * @param {string} value - Giá trị mới cần thiết lập
 */
export const updateConfig = async (key, value) => {
    try {
        // Gửi yêu cầu PUT cập nhật theo key cụ thể, truyền giá trị mới trong body
        const response = await axiosClient.put(`/SystemConfiguration/${key}`, { value });
        
        // Trả về dữ liệu đã cập nhật nếu thành công
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        // Log báo lỗi cụ thể cho key đang thực hiện cập nhật
        console.error(`Error updating configuration ${key}:`, error);
        throw error;
    }
};
