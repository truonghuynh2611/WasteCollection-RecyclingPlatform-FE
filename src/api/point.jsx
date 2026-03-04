const API_URL = "http://localhost:3001";

// 1. Lấy danh sách quy tắc cộng điểm (để biết mỗi loại rác được bao nhiêu điểm)
export const getPointRules = async () => {
  const response = await fetch(`${API_URL}/point_rules`);
  return response.json();
};

// 2. Ghi lại lịch sử giao dịch điểm (khi người dân nhận được điểm)
export const createPointTransaction = async (transactionData) => {
  const response = await fetch(`${API_URL}/point_transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...transactionData,
      created_at: new Date().toISOString(),
    }),
  });
  return response.json();
};

// 3. Lấy lịch sử nhận điểm của một người dùng cụ thể
// JSON Server hiện tại không sort/filter ổn định bằng query,
// nên lấy toàn bộ rồi filter + sort ở client.
export const getMyPointHistory = async (userId) => {
  const response = await fetch(`${API_URL}/point_transactions`);

  if (!response.ok) {
    throw new Error("Không tải được lịch sử điểm thưởng.");
  }

  const all = await response.json();
  const normalizedId = String(userId);

  const mine = Array.isArray(all)
    ? all.filter((t) => String(t.citizenId) === normalizedId)
    : [];

  return mine.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};
