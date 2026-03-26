// Nhập các hook của React (useState: quản lý trạng thái, useEffect: xử lý hiệu ứng phụ)
import { useState, useEffect } from "react";
// Nhập các icon cần thiết từ thư viện lucide-react để minh họa các chức năng (Tìm kiếm, Lọc, Thêm, Xem, Khóa/Mở khóa...)
import { Search, Filter, UserPlus, Eye, Lock, Unlock, ChevronDown } from "lucide-react";
// Nhập Sidebar dùng chung cho bố cục của Admin/Manager
import Sidebar from "../Layouts/Sidebar";
// Nhập các hàm gọi API liên quan đến người dùng từ thư mục api
import { getAllCitizens, getCitizenStats } from "../../api/user";

// Cấu hình màu sắc nhãn (Badge) tương ứng với từng vai trò trong hệ thống
const roleColors = { Citizen: "bg-blue-100 text-blue-700", Enterprise: "bg-purple-100 text-purple-700", Collector: "bg-emerald-100 text-emerald-700" };

/**
 * COMPONENT QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)
 * Chức năng: Hiển thị danh sách công dân, xem thống kê, tìm kiếm, lọc và thay đổi trạng thái tài khoản
 */
export default function UserManagement() {
  // CÁC TRẠNG THÁI (STATE) CỦA COMPONENT
  const [search, setSearch] = useState(""); // Lưu trữ từ khóa tìm kiếm (tên hoặc email)
  const [filterStatus, setFilterStatus] = useState("Tất cả"); // Trạng thái lọc: Tất cả, Hoạt động, Bị khóa
  const [selectedUser, setSelectedUser] = useState(null); // Lưu thông tin người dùng được chọn để xem chi tiết (trong Modal)
  const [users, setUsers] = useState([]); // Danh sách người dùng lấy từ API
  const [stats, setStats] = useState({ totalCitizens: 0, activeCitizens: 0, totalPoints: 0 }); // Lưu dữ liệu thống kê tổng quát
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu từ server

  // Gọi hàm lấy dữ liệu ngay khi trang được tải lần đầu
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Hàm gọi đồng thời các API để lấy danh sách người dùng và các số liệu thống kê
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllCitizens(), // Lấy danh sách toàn bộ công dân
        getCitizenStats() // Lấy thống kê số lượng và điểm
      ]);
      setUsers(usersData);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch user management data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm xử lý thay đổi trạng thái (Khóa/Mở khóa) của tài khoản
   * @param {string} id - ID của người dùng cần thay đổi
   */
  const toggleUserStatus = (id) => {
    // Lưu ý: Trong thực tế sẽ gọi API cập nhật database, ở đây đang demo cập nhật state cục bộ
    setUsers(prev => prev.map(u => u.userId === id
      ? { ...u, status: !u.status }
      : u
    ));
  };

  // Xử lý logic lọc danh sách người dùng dựa trên từ khóa tìm kiếm và trạng thái lọc
  const filtered = users.filter(u => {
    const matchSearch = (u.fullName || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || (filterStatus === "Hoạt động" ? u.status : !u.status);
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar bên trái */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="w-full">
            
            {/* PHẦN TIÊU ĐỀ (HEADER) */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
                <p className="text-gray-500 mt-1">Quản lý tài khoản công dân và doanh nghiệp trong hệ thống</p>
              </div>
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                <UserPlus className="w-4 h-4" />
                Thêm người dùng
              </button>
            </div>

            {/* CÁC THẺ THỐNG KÊ (STATS CARDS) */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tổng người dùng", value: stats.totalCitizens, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: stats.activeCitizens, color: "text-green-600", bg: "bg-green-50" },
                { label: "Bị khóa", value: stats.totalCitizens - stats.activeCitizens, color: "text-red-600", bg: "bg-red-50" },
                { label: "Tổng điểm (hệ thống)", value: stats.totalPoints, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-gray-200 p-5 shadow-sm`}>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* THANH CÔNG CỤ: TÌM KIẾM VÀ BỘ LỌC (FILTERS) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 p-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option>Tất cả</option>
                  <option>Hoạt động</option>
                  <option>Bị khóa</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500 ml-auto">{filtered.length} người dùng</p>
            </div>

            {/* BẢNG HIỂN THỊ DANH SÁCH (TABLE) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Người dùng", "Liên hệ", "Vai trò", "Điểm tích lũy", "Trạng thái", "Thao tác"].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    // Hiển thị khung chờ (Skeleton Loader) khi đang tải
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-6 h-16 bg-gray-50/50"></td>
                      </tr>
                    ))
                  ) : filtered.map(user => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      {/* Tên và Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.fullName?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{user.fullName}</span>
                        </div>
                      </td>
                      {/* Thông tin liên hệ */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      </td>
                      {/* Vai trò người dùng */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors["Citizen"]}`}>
                          Citizen
                        </span>
                      </td>
                      {/* Số điểm tích lũy */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">{user.totalPoints}</span>
                        <span className="text-xs text-gray-400 ml-1">điểm</span>
                      </td>
                      {/* Trạng thái tài khoản (Hoạt động/Bị khóa) */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status ? "bg-green-500" : "bg-red-500"}`} />
                          {user.status ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      {/* Các nút thao tác */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleUserStatus(user.userId)} className={`p-1.5 rounded-lg transition-colors ${
                            user.status
                              ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                          }`} title={user.status ? "Khóa tài khoản" : "Mở khóa"}>
                            {user.status ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Thông báo nếu không tìm thấy kết quả */}
              {!loading && filtered.length === 0 && (
                <div className="py-16 text-center text-gray-400">Không tìm thấy người dùng nào</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL XEM CHI TIẾT NGƯỜI DÙNG (DETAIL MODAL) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            {/* Header của Modal */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.fullName?.charAt(0) || "?"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedUser.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {selectedUser.status ? "Hoạt động" : "Bị khóa"}
                </span>
              </div>
            </div>
            {/* Danh sách thông tin chi tiết */}
            <div className="space-y-3 text-sm">
              {[
                ["Email", selectedUser.email],
                ["Số điện thoại", selectedUser.phone],
                ["Vai trò", "Citizen"],
                ["Điểm tích lũy", `${selectedUser.totalPoints} điểm`],
                ["User ID", `#${selectedUser.userId}`]
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            {/* Nút đóng Modal */}
            <button onClick={() => setSelectedUser(null)} className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
