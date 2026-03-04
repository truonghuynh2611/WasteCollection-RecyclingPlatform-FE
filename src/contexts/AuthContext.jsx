import { createContext, useContext, useState, useEffect } from "react";

const AUTH_STORAGE_KEY = "waste_auth_user";

// Map role id từ db.json (r1, r2, r3) sang tên hiển thị
export const ROLE_NAMES = {
  r1: "Admin",
  r2: "Collector",
  r3: "Citizen",
};

export const ROLES = {
  ADMIN: "r1",
  COLLECTOR: "r2",
  CITIZEN: "r3",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = (userFromApi) => {
    const roleId = userFromApi.role || userFromApi.roleId;
    const roleName = ROLE_NAMES[roleId] || "Citizen";
    const userToStore = {
      id: userFromApi.id,
      full_name: userFromApi.full_name,
      phone: userFromApi.phone,
      role: roleId,
      roleName,
      districtId: userFromApi.districtId,
      total_points: userFromApi.total_points,
    };
    setUser(userToStore);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isRole = (roleId) => user?.role === roleId;
  const isAdmin = () => isRole(ROLES.ADMIN);
  const isCollector = () => isRole(ROLES.COLLECTOR);
  const isCitizen = () => isRole(ROLES.CITIZEN);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isCollector,
    isCitizen,
    isRole,
    ROLES,
    ROLE_NAMES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
