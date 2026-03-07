/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AUTH_STORAGE_KEY = "waste_auth_user";

// Keep old references for compatibility, but primarily use string roles now.
export const ROLE_NAMES = {
  1: "Admin",
  2: "Collector",
  3: "Citizen",
  4: "Enterprise",
  5: "Manager",
  r1: "Admin",
  r2: "Collector", 
  r3: "Citizen",
  r5: "Manager"
};

export const ROLES = {
  ADMIN: "Admin",
  COLLECTOR: "Collector",
  CITIZEN: "Citizen",
  ENTERPRISE: "Enterprise",
  AREA_MANAGER: "Manager",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state lazily from localStorage to fix react-hooks/set-state-in-effect
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return null;
  });

  const login = (authData) => {
    // BE trả về { token, user: { ... } }
    const userFromApi = authData.user || authData;
    const roleId = userFromApi.role || userFromApi.roleId;
    const roleName = ROLE_NAMES[roleId] || roleId || "Citizen";

    const userToStore = {
      id: userFromApi.id,
      email: userFromApi.email,
      full_name: userFromApi.fullName || userFromApi.full_name,
      phone: userFromApi.phone,
      role: roleName,
      token: authData.token, // Cần lưu token để AxiosClient đọc được
    };
    
    setUser(userToStore);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isRole = (roleToCheck) => {
    if (!user) return false;
    // Hỗ trợ cả string role và old ID
    if (roleToCheck === ROLES.ADMIN) return user.role === "Admin" || user.role === "r1";
    if (roleToCheck === ROLES.COLLECTOR) return user.role === "Collector" || user.role === "r2";
    if (roleToCheck === ROLES.CITIZEN) return user.role === "Citizen" || user.role === "r3";
    return user.role === roleToCheck;
  };

  const isAdmin = () => isRole(ROLES.ADMIN);
  const isCollector = () => isRole(ROLES.COLLECTOR);
  const isCitizen = () => isRole(ROLES.CITIZEN);
  const isManager = () => isRole(ROLES.AREA_MANAGER);

  const value = {
    user,
    login,
    logout,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
