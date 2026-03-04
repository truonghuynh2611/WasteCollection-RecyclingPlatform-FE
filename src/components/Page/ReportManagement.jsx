import React, { useState } from "react";
import {
  Recycle,
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Database,
  Clock,
  Truck,
  CheckCircle,
  Filter,
  FileText,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const ReportManagement = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const stats = [
    {
      label: "Tổng yêu cầu",
      value: "1,248",
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Chờ xử lý",
      value: "45",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Đang thu gom",
      value: "12",
      icon: Truck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const reports = [
    {
      id: "REQ-2023-001",
      reporter: "Nguyễn Văn A",
      initials: "NA",
      type: "Nhựa",
      typeColor: "text-purple-600",
      typeBg: "bg-purple-50",
      typeBorder: "border-purple-100",
      address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1",
      date: "12/10/2023 08:30",
      status: "Đang chờ",
      statusClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
      hasAction: true,
    },
    {
      id: "REQ-2023-002",
      reporter: "Trần Thị B",
      initials: "TB",
      type: "Giấy",
      typeColor: "text-amber-600",
      typeBg: "bg-amber-50",
      typeBorder: "border-amber-100",
      address: "456 Nguyễn Huệ, Phường Bến Nghé, Quận 1",
      date: "12/10/2023 09:15",
      status: "Đã phân công",
      statusClass: "bg-blue-100 text-blue-700 border-blue-200",
      hasAction: false,
    },
    {
      id: "REQ-2023-003",
      reporter: "Lê Văn C",
      initials: "LC",
      type: "Kim loại",
      typeColor: "text-gray-600",
      typeBg: "bg-gray-50",
      typeBorder: "border-gray-200",
      address: "789 Pasteur, Phường 6, Quận 3",
      date: "11/10/2023 14:00",
      status: "Đang thu gom",
      statusClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
      hasAction: false,
    },
    {
      id: "REQ-2023-004",
      reporter: "Phạm Thị D",
      initials: "PD",
      type: "Nhựa",
      typeColor: "text-emerald-600",
      typeBg: "bg-emerald-50",
      typeBorder: "border-emerald-100",
      address: "321 Hai Bà Trưng, Phường 8, Quận 3",
      date: "11/10/2023 10:20",
      status: "Đã hoàn thành",
      statusClass: "bg-green-100 text-green-700 border-green-200",
      hasAction: false,
    },
  ];

  const tabs = [
    { name: "Tất cả", count: null },
    { name: "Chờ xử lý", count: 45 },
    { name: "Đã phân công", count: null },
    { name: "Đang thu gom", count: null },
    { name: "Đã hoàn thành", count: null },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-64 h-full border-r border-border-light bg-sidebar-bg flex-shrink-0 transition-all duration-300`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-3 px-2 py-4 mb-2">
            <div className="bg-primary rounded-lg p-1.5 text-white">
              <Recycle size={24} />
            </div>
            <span className="text-primary font-bold text-xl tracking-tight">
              Green Vietnam
            </span>
          </div>

          <nav className="flex flex-col gap-1 mt-4 flex-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider mt-2">
              CHÍNH
            </div>

            <SidebarLink icon={LayoutDashboard} label="Bảng điều khiển" />
            <SidebarLink icon={ClipboardList} label="Yêu cầu thu gom" active />
            <SidebarLink icon={Users} label="Quản lý Collector" />

            <div className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider mt-4">
              HOẠT ĐỘNG
            </div>
            <SidebarLink icon={Settings} label="Cấu hình điểm thưởng" />
          </nav>

          <div className="mt-auto border-t border-border-light pt-4 px-2">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <LogOut size={20} />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white sm:bg-slate-50">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-border-light px-6 py-3 bg-white z-10 h-16">
          <div className="flex items-center gap-4 md:hidden">
            <button className="text-text-main">
              <Menu size={24} />
            </button>
            <span className="text-primary font-bold text-lg">EcoConnect</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-text-secondary transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-6 w-px bg-border-light mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 py-1.5 px-2 rounded-lg transition-colors">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-text-secondary font-medium">
                  Quản trị viên
                </span>
              </div>
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-light shadow-sm"
                style={{
                  backgroundImage:
                    'url("https://picsum.photos/seed/admin/100/100")',
                }}
              ></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-slate-50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-main">
              Quản lý yêu cầu thu gom
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border border-border-light rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <h3
                      className={`text-text-main text-2xl font-extrabold mt-1 ${stat.label === "Chờ xử lý" ? "text-yellow-600" : stat.label === "Đang thu gom" ? "text-primary-dark" : ""}`}
                    >
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`${stat.bgColor} p-3 rounded-xl ${stat.color}`}
                  >
                    <stat.icon size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white border border-border-light rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
            <div className="p-4 border-b border-border-light bg-white">
              <h3 className="text-lg font-bold text-text-main">
                Danh sách yêu cầu thu gom
              </h3>
            </div>

            {/* Tabs */}
            <div className="border-b border-border-light overflow-x-auto bg-white">
              <div className="flex px-4 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center justify-center border-b-2 px-6 py-4 transition-colors text-sm font-bold ${
                      activeTab === tab.name
                        ? "border-primary-dark text-primary-dark"
                        : "border-transparent text-text-secondary hover:text-text-main"
                    }`}
                  >
                    {tab.name}
                    {tab.count && (
                      <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] py-0.5 px-2 rounded-full border border-yellow-200">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-border-light">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <Filter size={16} />
                </div>
                <select className="block w-full pl-10 pr-10 py-2.5 text-sm border border-border-light rounded-lg bg-white text-text-main focus:ring-emerald-500/20 focus:border-primary-dark outline-none appearance-none">
                  <option>Lọc theo loại rác</option>
                  <option>Nhựa</option>
                  <option>Giấy</option>
                  <option>Kim loại</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-secondary">
                  <ChevronLeft size={16} className="-rotate-90" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-light">
                      Người báo cáo
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-light">
                      Loại rác
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-light hidden sm:table-cell">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-light hidden md:table-cell">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-light">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-light text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {reports.map((report, idx) => (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${
                              idx === 0
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : idx === 1
                                  ? "bg-orange-100 text-orange-700 border-orange-200"
                                  : idx === 2
                                    ? "bg-slate-100 text-slate-700 border-slate-200"
                                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {report.initials}
                          </div>
                          <div className="flex flex-col">
                            <div className="text-sm font-bold text-text-main">
                              {report.reporter}
                            </div>
                            <div className="text-xs text-text-secondary">
                              #{report.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-2 px-2.5 py-1 rounded-full border w-fit ${report.typeBg} ${report.typeBorder}`}
                        >
                          {report.type === "Nhựa" ? (
                            <Recycle size={18} className={report.typeColor} />
                          ) : report.type === "Giấy" ? (
                            <FileText size={18} className={report.typeColor} />
                          ) : (
                            <Wrench size={18} className={report.typeColor} />
                          )}
                          <span
                            className={`text-[11px] font-bold ${report.typeColor}`}
                          >
                            {report.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-text-secondary hidden sm:table-cell max-w-xs truncate">
                        {report.address}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-text-secondary hidden md:table-cell">
                        {report.date}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${report.statusClass}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2">
                          {report.hasAction && (
                            <button className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
                              Phân công
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border-light bg-white px-6 py-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button className="relative inline-flex items-center rounded-md border border-border-light bg-white px-4 py-2 text-sm font-medium text-text-main hover:bg-slate-50">
                  Trước
                </button>
                <button className="relative ml-3 inline-flex items-center rounded-md border border-border-light bg-white px-4 py-2 text-sm font-medium text-text-main hover:bg-slate-50">
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-text-secondary">
                    Hiển thị <span className="font-bold text-text-main">1</span>{" "}
                    đến <span className="font-bold text-text-main">10</span>{" "}
                    trong số{" "}
                    <span className="font-bold text-text-main">1,248</span> kết
                    quả
                  </p>
                </div>
                <div>
                  <nav
                    aria-label="Pagination"
                    className="isolate inline-flex -space-x-px rounded-lg shadow-sm"
                  >
                    <button className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-text-secondary ring-1 ring-inset ring-border-light hover:bg-slate-50 focus:z-20 focus:outline-offset-0">
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      aria-current="page"
                      className="relative z-10 inline-flex items-center bg-primary-dark px-4 py-2 text-sm font-bold text-white focus:z-20"
                    >
                      1
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-text-secondary ring-1 ring-inset ring-border-light hover:bg-slate-50 focus:z-20">
                      2
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-text-secondary ring-1 ring-inset ring-border-light hover:bg-slate-50 focus:z-20">
                      3
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-text-secondary ring-1 ring-inset ring-border-light">
                      ...
                    </span>
                    <button className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-text-secondary ring-1 ring-inset ring-border-light hover:bg-slate-50 focus:z-20">
                      10
                    </button>
                    <button className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-text-secondary ring-1 ring-inset ring-border-light hover:bg-slate-50 focus:z-20">
                      <ChevronRight size={18} />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon: Icon, label, active = false }) => (
  <button
    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group mb-1 w-full text-left ${
      active
        ? "bg-primary-light text-primary border-r-4 border-primary"
        : "text-text-secondary hover:bg-slate-50 hover:text-text-main"
    }`}
  >
    <Icon
      size={20}
      className={
        active ? "text-primary" : "text-text-secondary group-hover:text-primary"
      }
    />
    <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
      {label}
    </span>
  </button>
);

export default ReportManagement;
