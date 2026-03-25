import axiosClient from "./axiosClient";

export const getAllCollectorsForAdmin = async () => {
    const response = await axiosClient.get("/Collector/admin/all");
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || "Lỗi khi lấy danh sách nhân viên");
};
