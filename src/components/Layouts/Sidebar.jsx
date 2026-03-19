import {
  LayoutGrid,
  ClipboardList,
  Users,
  UserCog,
  CalendarDays,
  Map,
  Settings,
  Recycle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const mainMenuItems = [
  { id: "dashboard",   label: "Bảng điều khiển",   icon: LayoutGrid,    path: "/admin" },
  { id: "requests",    label: "Yêu cầu thu gom",   icon: ClipboardList, path: "/reportManagement" },
  { id: "users",       label: "Quản lý người dùng", icon: Users,         path: "/userManagement" },
  { id: "collector",   label: "Quản lý người thu gom", icon: UserCog,      path: "/collectorManagement" },
  { id: "area",        label: "Quản lý khu vực",    icon: Map,           path: "/areaManagement" },
];

const activityMenuItems = [
  { id: "vouchers",  label: "Quản lý Voucher", icon: Recycle,      path: "/voucherManagement" },
  { id: "settings",  label: "Cấu hình điểm thưởng", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const renderMenuItems = (items) =>
    items.map((item) => {
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
          <Icon className="w-5 h-5 shrink-0" />
          <span className="text-sm">{item.label}</span>
        </button>
      );
    });

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <Recycle className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-800">EcoConnect</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            CHÍNH
          </p>
          {renderMenuItems(mainMenuItems)}
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            HOẠT ĐỘNG
          </p>
          {renderMenuItems(activityMenuItems)}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
