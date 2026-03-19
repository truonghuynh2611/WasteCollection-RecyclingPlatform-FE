/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AUTH_STORAGE_KEY = "waste_auth_user";

// Keep old references for compatibility, but primarily use string roles now.
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
        const parsed = JSON.parse(stored);
        // Tự động sửa lỗi nếu thiếu field 'id' (cho các session cũ)
        if (parsed) {
          if (!parsed.id) {
            parsed.id = parsed.userId || parsed.UserId || parsed.user_id;
          }
          if (!parsed.citizenId) {
            parsed.citizenId = parsed.CitizenId;
          }
          
          if (parsed.id || parsed.citizenId) {
             localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        return parsed;
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return null;
  });
  
  // Listen for storage changes across tabs to sync logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === AUTH_STORAGE_KEY && !e.newValue) {
        // If the auth key is removed in another tab, logout this tab too
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (authData) => {
    // BE trả về flat object: { token, refreshToken, userId, email, fullName, role, status, expiresAt }
    console.log("Raw authData from API:", authData);
    const userFromApi = authData.user || authData;
    const roleId = userFromApi.role || userFromApi.roleId;
    const roleName = ROLE_NAMES[roleId] || roleId || "Citizen";

    // BE trả về userId (camelCase), phải đảm bảo extract đúng
    const rawId = userFromApi.id || userFromApi.userId || userFromApi.UserId || userFromApi.citizenId || userFromApi.CitizenId || userFromApi.user_id;
    const numericId = rawId !== undefined && rawId !== null ? Number(rawId) : undefined;

    const userToStore = {
      id: numericId,
      citizenId: userFromApi.citizenId || userFromApi.CitizenId,
      email: userFromApi.email,
      full_name: userFromApi.fullName || userFromApi.FullName || userFromApi.full_name,
      phone: userFromApi.phone,
      role: roleName,
      roleName: roleName,
      token: authData.token || userFromApi.token,
    };
    
    console.log("Saving user to store (detailed):", userToStore);
    if (!userToStore.id) {
      console.warn("WARNING: No User ID found in API response! Keys available:", Object.keys(userFromApi));
    }
    setUser(userToStore);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
