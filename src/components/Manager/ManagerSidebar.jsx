import { LayoutGrid, ClipboardList, CalendarDays, LogOut, Recycle, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const menu = [
  { id: "dashboard", label: "Bảng điều khiển",     icon: LayoutGrid,    path: "/manager" },
  { id: "requests",  label: "Yêu cầu thu gom",     icon: ClipboardList, path: "/manager/requests" },
  { id: "collector", label: "Quản lý thu gom",     icon: Users,         path: "/manager/collector" },
  { id: "schedule",  label: "Quản lý lịch",        icon: CalendarDays,  path: "/manager/schedule" },
];

export default function ManagerSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Recycle className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-800">EcoConnect</p>
          <p className="text-xs text-indigo-500 font-medium tracking-wide">Manager Portal</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 bg-indigo-50 mx-4 mt-6 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
            {(user?.fullName || "M").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.fullName || "Quản lí KV"}</p>
            <p className="text-xs text-indigo-600 font-medium">Khu vực 1A • Quận 1</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu Quản Lý</p>
        {menu.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
             <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 text-sm transition-all ${
                active ? "bg-indigo-50 text-indigo-600 font-bold shadow-sm ring-1 ring-indigo-100" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
