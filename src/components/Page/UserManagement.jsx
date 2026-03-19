import { useState, useEffect } from "react";
import { Search, Filter, UserPlus, Eye, Lock, Unlock, ChevronDown } from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllCitizens, getCitizenStats } from "../../api/user";

const roleColors = { Citizen: "bg-blue-100 text-blue-700", Enterprise: "bg-purple-100 text-purple-700", Collector: "bg-emerald-100 text-emerald-700" };

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalCitizens: 0, activeCitizens: 0, totalPoints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllCitizens(),
        getCitizenStats()
      ]);
      setUsers(usersData);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch user management data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = (id) => {
    // This would call an API in production
    setUsers(prev => prev.map(u => u.userId === id
      ? { ...u, status: !u.status }
      : u
    ));
  };
  const filtered = users.filter(u => {
    const matchSearch = (u.fullName || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || (filterStatus === "Hoạt động" ? u.status : !u.status);
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
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

            {/* Stats */}
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

            {/* Filters */}
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

            {/* Table */}
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
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-6 h-16 bg-gray-50/50"></td>
                      </tr>
                    ))
                  ) : filtered.map(user => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.fullName?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors["Citizen"]}`}>
                          Citizen
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">{user.totalPoints}</span>
                        <span className="text-xs text-gray-400 ml-1">điểm</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status ? "bg-green-500" : "bg-red-500"}`} />
                          {user.status ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
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
              {!loading && filtered.length === 0 && (
                <div className="py-16 text-center text-gray-400">Không tìm thấy người dùng nào</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
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
            <button onClick={() => setSelectedUser(null)} className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
