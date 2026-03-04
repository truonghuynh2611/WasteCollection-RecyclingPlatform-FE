import {
  LayoutGrid,
  ClipboardList,
  Users,
  Settings,
  Recycle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { id: "dashboard", label: "Bảng điều khiển", icon: LayoutGrid, path: "/admin" },
  { id: "requests", label: "Yêu cầu thu gom", icon: ClipboardList, path: "/reportManagement" },
  { id: "collectors", label: "Quản lý Collector", icon: Users, path: "/collectors" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <Recycle className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-800">
          EcoConnect
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            CHÍNH
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            HOẠT ĐỘNG
          </p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Cấu hình điểm thưởng</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
