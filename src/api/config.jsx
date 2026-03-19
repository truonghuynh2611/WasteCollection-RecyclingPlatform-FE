import axiosClient from "./axiosClient";

/**
 * Get all system configurations
 */
export const getAllConfigs = async () => {
    try {
        const response = await axiosClient.get("/SystemConfiguration");
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching configurations:", error);
        throw error;
    }
};

/**
 * Update a specific system configuration
 * @param {string} key 
 * @param {string} value 
 */
export const updateConfig = async (key, value) => {
    try {
        const response = await axiosClient.put(`/SystemConfiguration/${key}`, { value });
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error(`Error updating configuration ${key}:`, error);
        throw error;
    }
};
