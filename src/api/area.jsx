// Nhập axiosClient đã được cấu hình Header Authorization
import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả các khu vực hoạt động trong hệ thống
 * Trả về: Mảng các đối tượng khu vực nếu thành công, ngược lại trả về mảng rỗng
 */
export const getAllAreas = async () => {
    try {
        // Gửi yêu cầu GET đến endpoint /Areas
        const response = await axiosClient.get("/Areas");
        
        // Kiểm tra nếu dữ liệu trả về tồn tại và đánh dấu thành công (success)
        if (response.data && response.data.success) {
            return response.data.data; // Trả về danh sách khu vực
        }
        return []; // Trả về mảng rỗng nếu không có dữ liệu hoặc success = false
    } catch (error) {
        // Ghi log lỗi ra console để phục vụ debugging
        console.error("Error fetching areas:", error);
        // Ném lỗi ra để component gọi hàm này có thể xử lý (vd: hiển thị thông báo lỗi)
        throw error;
    }
};

/**
 * Tạo một khu vực mới trong hệ thống
 * @param {Object} areaData - Thông tin của khu vực mới (tên, mô tả,...)
 */
export const createArea = async (areaData) => {
    // Gửi yêu cầu POST kèm theo dữ liệu khu vực
    const response = await axiosClient.post("/Areas", areaData);
    // Trả về toàn bộ dữ liệu phản hồi từ server
    return response.data;
};

/**
 * Cập nhật thông tin của một khu vực hiện có
 * @param {string|number} id - ID của khu vực cần cập nhật
 * @param {Object} areaData - Dữ liệu mới cần cập nhật
 */
export const updateArea = async (id, areaData) => {
    // Gửi yêu cầu PUT đến endpoint cụ thể của khu vực theo ID
    const response = await axiosClient.put(`/Areas/${id}`, areaData);
    return response.data;
};

/**
 * Xóa một khu vực khỏi hệ thống
 * @param {string|number} id - ID của khu vực cần xóa
 */
export const deleteArea = async (id) => {
    // Gửi yêu cầu DELETE đến endpoint tương ứng với ID
    const response = await axiosClient.delete(`/Areas/${id}`);
    return response.data;
};
