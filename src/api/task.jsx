const API_URL = "http://localhost:3001";

// --- DÀNH CHO ADMIN ---
// 1. Phân công một báo cáo rác cho nhân viên thu gom
export const assignTask = async (assignmentData) => {
  const response = await fetch(`${API_URL}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...assignmentData,
      assigned_at: new Date().toISOString(),
      accepted_at: null,
      completed_at: null,
    }),
  });
  return response.json();
};

// --- DÀNH CHO COLLECTOR (Nhân viên thu gom) ---
// 2. Lấy danh sách các công việc được giao cho mình.
// JSON Server hiện tại không filter query ổn định, nên:
// - Lấy toàn bộ assignments, filter theo collectorId ở client
// - Lấy thêm waste_reports và tự gắn vào field waste_report để tiện hiển thị
export const getMyTasks = async (collectorId) => {
  const [assignRes, reportRes] = await Promise.all([
    fetch(`${API_URL}/assignments`),
    fetch(`${API_URL}/waste_reports`),
  ]);

  if (!assignRes.ok || !reportRes.ok) {
    throw new Error("Không tải được danh sách công việc.");
  }

  const [allAssignments, allReports] = await Promise.all([
    assignRes.json(),
    reportRes.json(),
  ]);

  const normalizedId = String(collectorId);

  const myAssignments = Array.isArray(allAssignments)
    ? allAssignments.filter(
        (a) => String(a.collectorId) === normalizedId,
      )
    : [];

  const reportsById = new Map(
    (Array.isArray(allReports) ? allReports : []).map((r) => [String(r.id), r]),
  );

  return myAssignments.map((a) => ({
    ...a,
    waste_report: reportsById.get(String(a.reportId)) || null,
  }));
};

// 3. Cập nhật trạng thái công việc (Chấp nhận hoặc Hoàn thành)
export const updateTaskStatus = async (taskId, updateData) => {
  const response = await fetch(`${API_URL}/assignments/${taskId}`, {
    method: "PATCH", // Dùng PATCH để chỉ cập nhật các trường thay đổi
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  return response.json();
};
