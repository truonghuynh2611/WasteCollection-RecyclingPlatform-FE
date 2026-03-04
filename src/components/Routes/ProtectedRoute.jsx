import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Bảo vệ route theo role. Chỉ user có role nằm trong allowedRoles mới được vào.
 * @param {React.ReactNode} children - Nội dung cần bảo vệ
 * @param {string[]} allowedRoles - Mảng role id được phép (ROLES.ADMIN, ROLES.COLLECTOR, ROLES.CITIZEN)
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Không đủ quyền: chuyển về trang chủ (hoặc trang "403")
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
