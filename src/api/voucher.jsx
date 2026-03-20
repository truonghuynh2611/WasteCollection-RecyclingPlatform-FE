// Nhập axiosClient để quản lý Voucher và đổi quà
import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tất cả các Voucher hiện có trong hệ thống
 */
export const getVouchers = async () => {
  try {
    const response = await axiosClient.get("/Voucher");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return { success: false, error };
  }
};

/**
 * Lấy thông tin chi tiết của một Voucher theo ID
 * @param {string|number} id - ID của Voucher
 */
export const getVoucherById = async (id) => {
  try {
    const response = await axiosClient.get(`/Voucher/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching voucher ${id}:`, error);
    return { success: false, error };
  }
};

/**
 * Tạo một Voucher mới (Dành cho Admin)
 * @param {Object} voucherData - Thông tin voucher mới
 */
export const createVoucher = async (voucherData) => {
  try {
    const response = await axiosClient.post("/Voucher", voucherData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating voucher:", error);
    return { success: false, error };
  }
};

/**
 * Cập nhật thông tin Voucher hiện có
 * @param {string|number} id - ID Voucher cần sửa
 * @param {Object} voucherData - Dữ liệu cập nhật mới
 */
export const updateVoucher = async (id, voucherData) => {
  try {
    await axiosClient.put(`/Voucher/${id}`, voucherData);
    return { success: true };
  } catch (error) {
    console.error(`Error updating voucher ${id}:`, error);
    return { success: false, error };
  }
};

/**
 * Xóa Voucher khỏi hệ thống
 * @param {string|number} id - ID Voucher cần xóa
 */
export const deleteVoucher = async (id) => {
  try {
    await axiosClient.delete(`/Voucher/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting voucher ${id}:`, error);
    return { success: false, error };
  }
};

/**
 * Lấy danh sách các Voucher mà một công dân cụ thể đang sở hữu (đã đổi)
 * @param {string|number} citizenId - ID người dùng
 */
export const getCitizenVouchers = async (citizenId) => {
  try {
    const response = await axiosClient.get(`/Voucher/citizen/${citizenId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching vouchers for citizen ${citizenId}:`, error);
    return { success: false, error };
  }
};

/**
 * Thực hiện đổi điểm lấy Voucher
 * @param {string|number} citizenId - ID người đổi
 * @param {string|number} voucherId - ID voucher muốn nhận
 */
export const redeemVoucher = async (citizenId, voucherId) => {
  try {
    const response = await axiosClient.post("/Voucher/redeem", { citizenId, voucherId });
    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    // Trả về lỗi kèm thông báo từ server (vd: "Không đủ điểm")
    return { success: false, message: error.response?.data?.message || "Đã có lỗi xảy ra" };
  }
};

/**
 * Tải ảnh Voucher lên server
 * @param {File} file - File hình ảnh từ input type="file"
 */
export const uploadVoucherImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // Đưa file vào FormData để gửi dạng multipart/form-data
    const response = await axiosClient.post("/Voucher/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Trả về đường dẫn ảnh sau khi upload thành công
    return { success: true, imageUrl: response.data.imageUrl };
  } catch (error) {
    console.error("Error uploading voucher image:", error);
    return { success: false, error };
  }
};
