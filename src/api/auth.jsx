const API_URL = "http://localhost:3001"; // Đảm bảo trùng với port bạn chạy json-server

// --- API ĐĂNG KÝ (REGISTER) ---
export const registerUser = async (userData) => {
  // JSON Server (v1) trong project này không hỗ trợ filter bằng query params ổn định,
  // nên lấy toàn bộ users rồi filter ở client để tránh lỗi đăng nhập/đăng ký.
  const checkResponse = await fetch(`${API_URL}/users`);
  if (!checkResponse.ok) {
    throw new Error("Không kết nối được máy chủ. Kiểm tra backend đang chạy.");
  }
  const users = await checkResponse.json();
  const existingUsers = Array.isArray(users)
    ? users.filter((u) => String(u.phone) === String(userData.phone))
    : [];

  if (existingUsers.length > 0) {
    throw new Error("Số điện thoại này đã được đăng ký!");
  }

  // Nếu chưa tồn tại, tiến hành tạo user mới
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...userData,
      total_points: 0, // Mặc định điểm khi mới đăng ký
      roleId: "r3", // Mặc định là Citizen (người dân)
      created_at: new Date().toISOString(),
    }),
  });

  return response.json();
};

// --- API ĐĂNG NHẬP (LOGIN) ---
export const loginUser = async (phone, password) => {
  let response;
  try {
    response = await fetch(`${API_URL}/users`);
  } catch (err) {
    const msg =
      err?.message?.toLowerCase().includes("fetch") ||
      err?.message?.toLowerCase().includes("network")
        ? "Không kết nối được máy chủ. Hãy chạy backend: npm run backend (trong thư mục dự án)."
        : err?.message || "Lỗi kết nối";
    throw new Error(msg);
  }

  if (!response.ok) {
    throw new Error("Máy chủ lỗi. Kiểm tra backend đang chạy đúng port 3001.");
  }

  const users = await response.json();
  const normalizedPhone = String(phone).trim();
  const normalizedPassword = String(password).trim();

  const matched = Array.isArray(users)
    ? users.find(
        (u) =>
          String(u.phone).trim() === normalizedPhone &&
          String(u.password).trim() === normalizedPassword,
      )
    : null;

  if (!matched) {
    throw new Error("Số điện thoại hoặc mật khẩu không chính xác!");
  }

  return matched;
};
