import { Search, Bell, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Sidebar from "../Layouts/Sidebar";

const tabs = [
  { id: "all", label: "Tất cả", count: null },
  { id: "pending", label: "Chờ xử lý", count: 45 },
  { id: "assigned", label: "Đã phân công", count: null },
  { id: "collecting", label: "Đang thu gom", count: null },
  { id: "completed", label: "Đã hoàn thành", count: null },
];

const statusColors = {
  "Đang chờ": "bg-yellow-100 text-yellow-700",
  "Đã phân công": "bg-blue-100 text-blue-700",
  "Đang thu gom": "bg-purple-100 text-purple-700",
  "Đã hoàn thành": "bg-green-100 text-green-700",
};

const mockData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    code: "#REQ-2023-001",
    avatar: "NA",
    avatarBg: "bg-blue-100 text-blue-600",
    wasteType: "Nhựa",
    wasteColor: "text-purple-600",
    wasteBg: "bg-purple-50",
    address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1",
    date: "12/10/2023 08:30",
    status: "Đang chờ",
  },
  {
    id: 2,
    name: "Trần Thị B",
    code: "#REQ-2023-002",
    avatar: "TB",
    avatarBg: "bg-orange-100 text-orange-600",
    wasteType: "Giấy",
    wasteColor: "text-orange-600",
    wasteBg: "bg-orange-50",
    address: "456 Nguyễn Huệ, Phường Bến Nghé, Quận 1",
    date: "12/10/2023 09:15",
    status: "Đã phân công",
  },
  {
    id: 3,
    name: "Lê Văn C",
    code: "#REQ-2023-003",
    avatar: "LC",
    avatarBg: "bg-gray-100 text-gray-600",
    wasteType: "Kim loại",
    wasteColor: "text-gray-600",
    wasteBg: "bg-gray-50",
    address: "789 Pasteur, Phường 6, Quận 3",
    date: "11/10/2023 14:00",
    status: "Đang thu gom",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    code: "#REQ-2023-004",
    avatar: "PD",
    avatarBg: "bg-green-100 text-green-600",
    wasteType: "Nhựa",
    wasteColor: "text-purple-600",
    wasteBg: "bg-purple-50",
    address: "321 Hai Bà Trưng, Phường 8, Quận 3",
    date: "11/10/2023 10:20",
    status: "Đã hoàn thành",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    code: "#REQ-2023-005",
    avatar: "HE",
    avatarBg: "bg-pink-100 text-pink-600",
    wasteType: "Giấy",
    wasteColor: "text-orange-600",
    wasteBg: "bg-orange-50",
    address: "654 Võ Văn Tần, Phường 5, Quận 3",
    date: "11/10/2023 11:45",
    status: "Đang chờ",
  },
  {
    id: 6,
    name: "Đỗ Thị F",
    code: "#REQ-2023-006",
    avatar: "DF",
    avatarBg: "bg-indigo-100 text-indigo-600",
    wasteType: "Kim loại",
    wasteColor: "text-gray-600",
    wasteBg: "bg-gray-50",
    address: "987 Cách Mạng Tháng 8, Phường 7, Quận 3",
    date: "10/10/2023 16:30",
    status: "Đã phân công",
  },
  {
    id: 7,
    name: "Vũ Văn G",
    code: "#REQ-2023-007",
    avatar: "VG",
    avatarBg: "bg-yellow-100 text-yellow-700",
    wasteType: "Nhựa",
    wasteColor: "text-purple-600",
    wasteBg: "bg-purple-50",
    address: "147 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 1",
    date: "10/10/2023 13:20",
    status: "Đang thu gom",
  },
  {
    id: 8,
    name: "Bùi Thị H",
    code: "#REQ-2023-008",
    avatar: "BH",
    avatarBg: "bg-teal-100 text-teal-600",
    wasteType: "Giấy",
    wasteColor: "text-orange-600",
    wasteBg: "bg-orange-50",
    address: "258 Trần Hưng Đạo, Phường 10, Quận 5",
    date: "10/10/2023 09:00",
    status: "Đã hoàn thành",
  },
  {
    id: 9,
    name: "Ngô Văn I",
    code: "#REQ-2023-009",
    avatar: "NI",
    avatarBg: "bg-cyan-100 text-cyan-600",
    wasteType: "Kim loại",
    wasteColor: "text-gray-600",
    wasteBg: "bg-gray-50",
    address: "369 Điện Biên Phủ, Phường 17, Quận Bình Thạnh",
    date: "09/10/2023 15:45",
    status: "Đang chờ",
  },
  {
    id: 10,
    name: "Lý Thị K",
    code: "#REQ-2023-010",
    avatar: "LK",
    avatarBg: "bg-lime-100 text-lime-700",
    wasteType: "Nhựa",
    wasteColor: "text-purple-600",
    wasteBg: "bg-purple-50",
    address: "741 Xô Viết Nghệ Tĩnh, Phường 25, Quận Bình Thạnh",
    date: "09/10/2023 10:15",
    status: "Đã hoàn thành",
  },
];

const ReportManagement = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm yêu cầu, địa điểm..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
              <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    Doanh nghiệp Tái chế A
                  </p>
                  <p className="text-xs text-gray-500">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">DA</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Quản lý yêu cầu thu gom
            </h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex items-center gap-6 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 transition-colors relative ${
                        activeTab === tab.id
                          ? "border-green-500 text-green-600 font-medium"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <span className="text-sm">{tab.label}</span>
                      {tab.count && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Lọc theo loại rác
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Người báo cáo
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Loại rác
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Địa chỉ
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ngày gửi
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockData.map((request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${request.avatarBg}`}
                              >
                                {request.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {request.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {request.code}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${request.wasteBg} ${request.wasteColor}`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                              </svg>
                              {request.wasteType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-700 max-w-xs truncate">
                              {request.address}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-600">
                              {request.date}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[request.status] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Hiển thị <span className="font-medium">1</span> đến{" "}
                    <span className="font-medium">10</span> trong số{" "}
                    <span className="font-medium">1,248</span> kết quả
                  </p>

                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    {[1, 2, 3].map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-green-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-2 text-gray-500">...</span>
                    <button className="w-9 h-9 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      10
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportManagement;
