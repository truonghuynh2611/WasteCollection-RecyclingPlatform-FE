import axiosClient from "./axiosClient";

/**
 * [Leader only] Get all reports assigned to the current collector's team
 */
export const getLeaderTeamReports = async () => {
  const response = await axiosClient.get("/Collector/leader/reports");
  return response.data;
};

/**
 * [Leader only] Update a report (only Pending reports can be updated)
 */
export const updateReportByLeader = async (reportId, updateData) => {
  const response = await axiosClient.put(`/Collector/leader/reports/${reportId}`, updateData);
  return response.data;
};

/**
 * [Leader only] Delete a report (only Pending reports can be deleted)
 */
export const deleteReportByLeader = async (reportId) => {
  const response = await axiosClient.delete(`/Collector/leader/reports/${reportId}`);
  return response.data;
};
