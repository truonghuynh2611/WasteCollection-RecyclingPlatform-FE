import axiosClient from "./axiosClient";

export const getCitizenRankings = async () => {
  try {
    const response = await axiosClient.get("/Citizen");
    if (response.data && response.data.success) {
      // Sort citizens by points descending
      const sorted = response.data.data.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      return { success: true, data: sorted };
    }
    return { success: false, message: "Không thể lấy dữ liệu xếp hạng" };
  } catch (error) {
    console.error("Error fetching rankings:", error);
    throw error;
  }
};
