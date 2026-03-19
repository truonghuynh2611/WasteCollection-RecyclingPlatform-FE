import axiosClient from "./axiosClient";

export const getVouchers = async () => {
  try {
    const response = await axiosClient.get("/Voucher");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return { success: false, error };
  }
};

export const getVoucherById = async (id) => {
  try {
    const response = await axiosClient.get(`/Voucher/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching voucher ${id}:`, error);
    return { success: false, error };
  }
};

export const createVoucher = async (voucherData) => {
  try {
    const response = await axiosClient.post("/Voucher", voucherData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating voucher:", error);
    return { success: false, error };
  }
};

export const updateVoucher = async (id, voucherData) => {
  try {
    await axiosClient.put(`/Voucher/${id}`, voucherData);
    return { success: true };
  } catch (error) {
    console.error(`Error updating voucher ${id}:`, error);
    return { success: false, error };
  }
};

export const deleteVoucher = async (id) => {
  try {
    await axiosClient.delete(`/Voucher/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting voucher ${id}:`, error);
    return { success: false, error };
  }
};

export const getCitizenVouchers = async (citizenId) => {
  try {
    const response = await axiosClient.get(`/Voucher/citizen/${citizenId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching vouchers for citizen ${citizenId}:`, error);
    return { success: false, error };
  }
};

export const redeemVoucher = async (citizenId, voucherId) => {
  try {
    const response = await axiosClient.post("/Voucher/redeem", { citizenId, voucherId });
    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    return { success: false, message: error.response?.data?.message || "Đã có lỗi xảy ra" };
  }
};

export const uploadVoucherImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post("/Voucher/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, imageUrl: response.data.imageUrl };
  } catch (error) {
    console.error("Error uploading voucher image:", error);
    return { success: false, error };
  }
};
