import { useState } from "react";
import { Search, Filter, UserPlus, Eye, Lock, Unlock, ChevronDown } from "lucide-react";
import Sidebar from "../Layouts/Sidebar";

const USERS = [
  { id: 1, name: "Nguyễn Thị Mai", email: "mai.nguyen@gmail.com", phone: "0901234567", role: "Citizen", status: "Hoạt động", joined: "12/01/2025", reports: 12 },
  { id: 2, name: "Trần Văn Hùng", email: "hung.tran@gmail.com", phone: "0912345678", role: "Citizen", status: "Hoạt động", joined: "05/02/2025", reports: 7 },
  { id: 3, name: "Lê Thị Lan", email: "lan.le@gmail.com", phone: "0923456789", role: "Citizen", status: "Bị khóa", joined: "20/11/2024", reports: 3 },
  { id: 4, name: "Phạm Quốc Bảo", email: "bao.pham@gmail.com", phone: "0934567890", role: "Citizen", status: "Hoạt động", joined: "18/03/2025", reports: 21 },
  { id: 5, name: "Hoàng Thị Yến", email: "yen.hoang@gmail.com", phone: "0945678901", role: "Citizen", status: "Hoạt động", joined: "02/01/2025", reports: 5 },
  { id: 6, name: "Đặng Minh Tuấn", email: "tuan.dang@gmail.com", phone: "0956789012", role: "Citizen", status: "Bị khóa", joined: "14/12/2024", reports: 0 },
  { id: 7, name: "Vũ Thị Hồng", email: "hong.vu@gmail.com", phone: "0967890123", role: "Citizen", status: "Hoạt động", joined: "08/02/2025", reports: 15 },
];

const roleColors = { Citizen: "bg-blue-100 text-blue-700", Enterprise: "bg-purple-100 text-purple-700" };

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState(USERS);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === "Hoạt động" ? "Bị khóa" : "Hoạt động" }
      : u
    ));
  };

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
                { label: "Tổng người dùng", value: users.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: users.filter(u => u.status === "Hoạt động").length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Bị khóa", value: users.filter(u => u.status === "Bị khóa").length, color: "text-red-600", bg: "bg-red-50" },
                { label: "Báo cáo mới (30 ngày)", value: 37, color: "text-blue-600", bg: "bg-blue-50" },
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
                    {["Người dùng", "Liên hệ", "Vai trò", "Báo cáo", "Ngày tham gia", "Trạng thái", "Thao tác"].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || "bg-gray-100 text-gray-600"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">{user.reports}</span>
                        <span className="text-xs text-gray-400 ml-1">báo cáo</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.joined}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status === "Hoạt động" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Hoạt động" ? "bg-green-500" : "bg-red-500"}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleUserStatus(user.id)} className={`p-1.5 rounded-lg transition-colors ${
                            user.status === "Hoạt động"
                              ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                          }`} title={user.status === "Hoạt động" ? "Khóa tài khoản" : "Mở khóa"}>
                            {user.status === "Hoạt động" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
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
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedUser.status === "Hoạt động" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[["Email", selectedUser.email], ["Số điện thoại", selectedUser.phone], ["Vai trò", selectedUser.role], ["Số báo cáo", `${selectedUser.reports} báo cáo`], ["Ngày tham gia", selectedUser.joined]].map(([k, v]) => (
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
