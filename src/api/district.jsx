import axiosClient from "./axiosClient";

export const getAllDistricts = async () => {
    try {
        const response = await axiosClient.get("/District");
        return response.data;
    } catch (error) {
        console.error("Error fetching districts:", error);
        throw error;
    }
};

export const getDistrictDetails = async (id) => {
    try {
        const response = await axiosClient.get(`/District/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching district ${id}:`, error);
        throw error;
    }
};
