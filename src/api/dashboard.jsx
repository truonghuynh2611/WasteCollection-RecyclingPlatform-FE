import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getAdminDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Dashboard/admin`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        throw error;
    }
};

export const getCollectorDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Dashboard/collector`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching collector dashboard stats:", error);
        throw error;
    }
};
