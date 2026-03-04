const BASE_URL = "http://localhost:3001";

// Hàm gửi báo cáo rác mới
export const createWasteReport = async (reportData) => {
  const response = await fetch(`${BASE_URL}/waste_reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  return response.json();
};

// Hàm lấy danh sách báo cáo rác
export const getWasteReports = async () => {
  const response = await fetch(`${BASE_URL}/waste_reports`);
  return response.json();
};
