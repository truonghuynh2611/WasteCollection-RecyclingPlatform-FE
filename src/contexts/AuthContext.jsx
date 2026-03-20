/* eslint-disable react-refresh/only-export-components */
// Nhập các hook cần thiết từ React để quản lý context và trạng thái toàn cục
import { createContext, useContext, useState, useEffect } from "react";

// Khóa dùng để lưu trữ thông tin xác thực trong LocalStorage của trình duyệt
const AUTH_STORAGE_KEY = "waste_auth_user";

/**
 * ROLE_NAMES: Bảng ánh xạ mã vai trò (từ Backend) sang tên vai trò thân thiện.
 * Hỗ trợ cả định dạng số cũ và định dạng chuỗi mới (r1, r2...).
 */
export const ROLE_NAMES = {
  0: "Citizen",
  1: "Collector",
  2: "Enterprise",
  3: "Admin",
  4: "Manager",
  r1: "Admin",
  r2: "Collector", 
  r3: "Citizen",
  r5: "Manager"
};

/**
 * ROLES: Định nghĩa các hằng số vai trò để sử dụng thống nhất trong toàn bộ ứng dụng.
 */
export const ROLES = {
  ADMIN: "Admin",
  COLLECTOR: "Collector",
  CITIZEN: "Citizen",
  ENTERPRISE: "Enterprise",
  AREA_MANAGER: "Manager",
};

// Khởi tạo Context cho xác thực
const AuthContext = createContext(null);

/**
 * AuthProvider: Thành phần bao bọc (Wrapper) cung cấp trạng thái xác thực cho toàn bộ ứng dụng.
 */
export function AuthProvider({ children }) {
  // Khởi tạo trạng thái 'user' từ LocalStorage (Lazy initialization)
  // Điều này giúp duy trì trạng thái đăng nhập ngay cả khi người dùng làm mới trang (F5).
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Tự động chuẩn hóa dữ liệu nếu thiếu trường 'id' hoặc 'citizenId' từ các phiên bản cũ
        if (parsed) {
          if (!parsed.id) {
            parsed.id = parsed.userId || parsed.UserId || parsed.user_id;
          }
          if (!parsed.citizenId) {
            parsed.citizenId = parsed.CitizenId;
          }
          
          // Cập nhật lại LocalStorage nếu có thay đổi để đồng bộ dữ liệu
          if (parsed.id || parsed.citizenId) {
             localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        return parsed;
      } catch {
        // Nếu dữ liệu trong LocalStorage bị lỗi, xóa bỏ để tránh lỗi ứng dụng
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return null;
  });
  
  /**
   * Hiệu ứng: Lắng nghe sự thay đổi của LocalStorage từ các tab khác.
   * Giúp đồng bộ trạng thái đăng xuất giữa nhiều tab trình duyệt đang mở cùng lúc.
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Nếu khóa xác thực bị xóa ở một tab khác (đăng xuất), tab này cũng sẽ tự động đăng xuất
      if (e.key === AUTH_STORAGE_KEY && !e.newValue) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Hàm login: Xử lý lưu trữ thông tin sau khi đăng nhập thành công từ API.
   * @param {Object} authData - Dữ liệu trả về từ API đăng nhập.
   */
  const login = (authData) => {
    console.log("Dữ liệu auth thô từ API:", authData);
    const userFromApi = authData.user || authData;
    
    // Xác định vai trò dựa trên ID hoặc tên vai trò trả về
    const roleId = userFromApi.role || userFromApi.roleId;
    const roleName = ROLE_NAMES[roleId] || roleId || "Citizen";

    // Trích xuất ID người dùng từ các trường tiềm năng khác nhau (Backend có thể trả về các kiểu case khác nhau)
    const rawId = userFromApi.id || userFromApi.userId || userFromApi.UserId || userFromApi.citizenId || userFromApi.CitizenId || userFromApi.user_id;
    const numericId = rawId !== undefined && rawId !== null ? Number(rawId) : undefined;

    // Tạo đối tượng người dùng chuẩn hóa để lưu trữ trong ứng dụng
    const userToStore = {
      id: numericId,
      citizenId: userFromApi.citizenId || userFromApi.CitizenId,
      email: userFromApi.email,
      fullName: userFromApi.fullName || userFromApi.FullName || userFromApi.full_name,
      phone: userFromApi.phone,
      role: roleName,
      roleName: roleName,
      token: authData.token || userFromApi.token,
      totalPoints: userFromApi.totalPoints || userFromApi.TotalPoints || 0,
    };
    
    console.log("Đang lưu người dùng vào bộ nhớ:", userToStore);
    if (!userToStore.id) {
      console.warn("CẢNH BÁO: Không tìm thấy ID người dùng trong phản hồi API!");
    }
    
    // Cập nhật trạng thái React và lưu vào LocalStorage
    setUser(userToStore);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));
  };

  /**
   * Hàm logout: Xóa thông tin người dùng và đăng xuất khỏi hệ thống.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  /**
   * Hàm updateUser: Cập nhật một phần thông tin người dùng (ví dụ: sau khi đổi tên hoặc tích điểm).
   */
  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Hàm kiểm tra vai trò người dùng.
   * Hỗ trợ cả tên chuỗi mới và các mã 'r' cũ để đảm bảo tính tương thích cao.
   */
  const isRole = (roleToCheck) => {
    if (!user) return false;
    if (roleToCheck === ROLES.ADMIN) return user.role === "Admin" || user.role === "r1";
    if (roleToCheck === ROLES.COLLECTOR) return user.role === "Collector" || user.role === "r2";
    if (roleToCheck === ROLES.CITIZEN) return user.role === "Citizen" || user.role === "r3";
    return user.role === roleToCheck;
  };

  // Các hàm tiện ích để kiểm tra nhanh vai trò
  const isAdmin = () => isRole(ROLES.ADMIN);
  const isCollector = () => isRole(ROLES.COLLECTOR);
  const isCitizen = () => isRole(ROLES.CITIZEN);
  const isManager = () => isRole(ROLES.AREA_MANAGER);

  // Giá trị cung cấp cho Context
  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin,
    isCollector,
    isCitizen,
    isManager,
    isRole,
    ROLES,
    ROLE_NAMES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth: Hook tùy chỉnh để dễ dàng truy cập AuthContext từ bất kỳ component con nào.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
