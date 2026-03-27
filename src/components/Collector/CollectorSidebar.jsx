// Nhập các hook từ React Router
import { NavLink, useNavigate } from "react-router-dom";
// Nhập các icon từ thư viện lucide-react
import { LayoutDashboard, ClipboardList, Users, FileBarChart2, LogOut, Crown } from "lucide-react";
// Nhập context xác thực để lấy thông tin người dùng và hàm đăng xuất
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { getAllCollectors } from "../../api/team";

/**
 * COMPONENT SIDEBAR DÀNH CHO COLLECTOR
 * Chứa thông tin người dùng và các liên kết điều hướng chính
 * Tự động hiện/ẩn mục "Báo cáo" tùy theo vai trò Leader/Member
 */
export default function CollectorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLeader, setIsLeader] = useState(false);

  // Detect if the logged-in user is a Leader by querying the team's collector list
  useEffect(() => {
    const detectRole = async () => {
      try {
        const res = await getAllCollectors();
        const allCollectors = res.success ? res.data : [];
        const myCollector = allCollectors.find(
          (c) => c.collectorId === user?.collectorId || c.userId === user?.id
        );
        if (myCollector?.role === "Leader") {
          setIsLeader(true);
        }
      } catch {
        // silent fail – default to member if API fails
      }
    };
    if (user) detectRole();
  }, [user]);

  // Xử lý sự kiện đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * DANH SÁCH CÁC MỤC MENU TRÊN SIDEBAR
   */
  const menuItems = [
    { path: "/collector", icon: LayoutDashboard, label: "Bảng điều khiển", end: true },
    { path: "/collector/tasks", icon: ClipboardList, label: "Nhiệm vụ", end: false },
    { path: "/collector/members", icon: Users, label: "Thành viên", end: false },
  ];

  // Leader-only menu item
  if (isLeader) {
    menuItems.push({
      path: "/collector/report",
      icon: FileBarChart2,
      label: "Báo cáo",
      end: false,
      isLeaderOnly: true,
    });
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0">
      {/* USER PROFILE CARD */}
      <div className="px-6 pt-8 pb-6 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg ${
              isLeader
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : "bg-gradient-to-br from-emerald-400 to-teal-600"
            }`}
          >
            {(user?.fullName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-black text-gray-800 text-sm truncate">{user?.fullName || "Collector"}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">
              {user?.email}
            </p>
            <span
              className={`inline-flex items-center gap-1 mt-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isLeader
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isLeader && <Crown className="w-2.5 h-2.5" />}
              {isLeader ? "Trưởng nhóm" : "Thành viên"}
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? item.isLeaderOnly
                    ? "bg-amber-500 text-white shadow-xl shadow-amber-100 font-bold scale-[1.02]"
                    : "bg-emerald-600 text-white shadow-xl shadow-emerald-100 font-bold scale-[1.02]"
                  : "text-gray-400 hover:bg-gray-50 hover:text-emerald-600"
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold tracking-wide">{item.label}</span>
            {item.isLeaderOnly && (
              <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100/30 text-amber-200 border border-amber-300/30 tracking-widest uppercase">
                Leader
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
