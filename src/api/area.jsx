import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả khu vực
 */
export const getAllAreas = async () => {
    try {
        const response = await axiosClient.get("/Areas");
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching areas:", error);
        throw error;
    }
};

/**
 * Tạo khu vực mới
 */
export const createArea = async (areaData) => {
    const response = await axiosClient.post("/Areas", areaData);
    return response.data;
};

/**
 * Cập nhật khu vực
 */
export const updateArea = async (id, areaData) => {
    const response = await axiosClient.put(`/Areas/${id}`, areaData);
    return response.data;
};

/**
 * Xóa khu vực
 */
export const deleteArea = async (id) => {
    const response = await axiosClient.delete(`/Areas/${id}`);
    return response.data;
};
