import axiosClient from "./axiosClient";

export const getAllTeams = async () => {
  const response = await axiosClient.get("/Team");
  if (response.data && response.data.success) {
    return response.data.data;
  }
  return [];
};

export const createTeam = async (teamData) => {
  const response = await axiosClient.post("/Team", teamData);
  return response.data;
};

export const addCollectorToTeam = async (teamId, collectorId) => {
  const response = await axiosClient.put(`/Team/${teamId}/collectors`, collectorId, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data;
};

export const assignReportToTeam = async (assignmentData) => {
  const response = await axiosClient.post("/Team/assign-report", assignmentData);
  return response.data;
};
