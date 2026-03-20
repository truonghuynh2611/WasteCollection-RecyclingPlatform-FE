// Nhập các component điều hướng từ thư viện react-router-dom
import { Navigate, useLocation } from "react-router-dom";
// Nhập hook useAuth để lấy thông tin trạng thái đăng nhập
import { useAuth } from "../../contexts/AuthContext";

/**
 * COMPONENT BẢO VỆ ĐƯỜNG DẪN (PROTECTED ROUTE)
 * Chức năng: Kiểm tra quyền truy cập của người dùng trước khi hiển thị nội dung bên trong.
 * @param {React.ReactNode} children - Các component con sẽ được hiển thị nếu thỏa mãn điều kiện
 * @param {string[]} allowedRoles - Danh sách các mã quyền (Role ID) được phép truy cập
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  // Lấy thông tin user và trạng thái xác thực từ AuthContext
  const { user, isAuthenticated } = useAuth();
  // Lấy vị trí URL hiện tại để quay lại sau khi đăng nhập (nếu cần)
  const location = useLocation();

  /**
   * TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP
   * Nếu người dùng chưa đăng nhập (isAuthenticated = false),
   * hệ thống sẽ tự động chuyển hướng về trang /login.
   * Tham số 'state' giúp lưu lại trang hiện tại để sau khi đăng nhập xong có thể quay lại đúng chỗ đó.
   */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP NHƯNG KHÔNG ĐỦ QUYỀN (ROLES)
   * Nếu route yêu cầu các quyền cụ thể (allowedRoles có phần tử) 
   * mà quyền của User hiện tại không nằm trong danh sách đó,
   * hệ thống sẽ đẩy người dùng về trang chủ để đảm bảo an ninh.
   */
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Không đủ quyền: Chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  /**
   * TRƯỜNG HỢP 3: THỎA MÃN TẤT CẢ ĐIỀU KIỆN
   * Trả về nội dung (children) của component để hiển thị cho người dùng.
   */
  return children;
}

export default ProtectedRoute;
