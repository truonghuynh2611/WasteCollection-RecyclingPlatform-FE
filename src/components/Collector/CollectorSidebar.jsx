import { LayoutGrid, ClipboardList, CalendarDays, LogOut, Recycle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const menu = [
  { id: "dashboard", label: "Bảng điều khiển",     icon: LayoutGrid,    path: "/collector" },
  { id: "tasks",     label: "Quản lý công việc",     icon: ClipboardList, path: "/collector/tasks" },
  { id: "schedule",  label: "Lịch làm việc",         icon: CalendarDays,  path: "/collector/schedule" },
];

export default function CollectorSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="w-60 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
      {/* Brand */}
      <div className="p-5 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
          <Recycle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">EcoConnect</p>
          <p className="text-xs text-gray-400">Collector Portal</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 bg-green-50 mx-3 mt-4 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.fullName || "S").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName || "Người thu gom"}</p>
            <p className="text-xs text-green-600">Collector</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
        {menu.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                active ? "bg-green-50 text-green-600 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
