import { useState } from "react";
import { Search, UserPlus, Eye, Lock, Unlock, ChevronDown, Briefcase, Star } from "lucide-react";
import Sidebar from "../Layouts/Sidebar";

const STAFF = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@ecoconnect.vn", phone: "0901111111", team: "Team Alpha", area: "Khu vực 1A", status: "Hoạt động", completed: 120, rating: 4.9, joined: "01/06/2024" },
  { id: 2, name: "Trần Thị Bích", email: "bich.tran@ecoconnect.vn", phone: "0902222222", team: "Team Beta", area: "Khu vực 1A", status: "Hoạt động", completed: 95, rating: 4.7, joined: "15/07/2024" },
  { id: 3, name: "Lê Văn Cường", email: "cuong.le@ecoconnect.vn", phone: "0903333333", team: "Team Gamma", area: "Khu vực 1B", status: "Hoạt động", completed: 78, rating: 4.5, joined: "02/08/2024" },
  { id: 4, name: "Phạm Minh Dũng", email: "dung.pham@ecoconnect.vn", phone: "0904444444", team: "Team Delta", area: "Khu vực 2A", status: "Nghỉ phép", completed: 68, rating: 4.3, joined: "10/09/2024" },
  { id: 5, name: "Hoàng Thị Emilia", email: "emilia.hoang@ecoconnect.vn", phone: "0905555555", team: "Team Epsilon", area: "Khu vực 2A", status: "Hoạt động", completed: 55, rating: 4.2, joined: "20/10/2024" },
  { id: 6, name: "Vũ Quốc Fang", email: "fang.vu@ecoconnect.vn", phone: "0906666666", team: "Team Zeta", area: "Khu vực 2B", status: "Bị khóa", completed: 22, rating: 3.8, joined: "01/11/2024" },
];

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{value}</span>
    </div>
  );
}

export default function CollectorManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState(STAFF);

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.team.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id) => {
    setStaff(prev => prev.map(s => s.id === id
      ? { ...s, status: s.status === "Hoạt động" ? "Bị khóa" : "Hoạt động" }
      : s
    ));
  };

  const statusStyle = { "Hoạt động": "bg-green-100 text-green-700", "Nghỉ phép": "bg-yellow-100 text-yellow-700", "Bị khóa": "bg-red-100 text-red-600" };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý người thu gom</h1>
                <p className="text-gray-500 mt-1">Quản lý đội ngũ người thu gom rác theo khu vực</p>
              </div>
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                <UserPlus className="w-4 h-4" />
                Thêm người thu gom
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tổng người thu gom", value: staff.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: staff.filter(s => s.status === "Hoạt động").length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Đang nghỉ phép", value: staff.filter(s => s.status === "Nghỉ phép").length, color: "text-yellow-600", bg: "bg-yellow-50" },
                { label: "Tổng nhiệm vụ HT", value: staff.reduce((sum, s) => sum + s.completed, 0), color: "text-blue-600", bg: "bg-blue-50" },
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
                  placeholder="Tìm kiếm theo tên, team..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option>Tất cả</option>
                  <option>Hoạt động</option>
                  <option>Nghỉ phép</option>
                  <option>Bị khóa</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500 ml-auto">{filtered.length} người thu gom</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{s.team}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[s.status]}`}>{s.status}</span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Khu vực</span>
                      <span className="text-gray-700 font-medium">{s.area}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Đánh giá</span>
                      <StarRating value={s.rating} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hoàn thành</span>
                      <span className="font-semibold text-green-600">{s.completed} nhiệm vụ</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => setSelectedStaff(s)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Xem chi tiết
                    </button>
                    <button
                      onClick={() => toggleStatus(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                        s.status === "Hoạt động"
                          ? "text-red-600 bg-red-50 hover:bg-red-100"
                          : "text-green-600 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {s.status === "Hoạt động" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStaff(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedStaff.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedStaff.name}</h3>
                <p className="text-sm text-gray-500">{selectedStaff.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                ["Số điện thoại", selectedStaff.phone],
                ["Team", selectedStaff.team],
                ["Khu vực", selectedStaff.area],
                ["Nhiệm vụ hoàn thành", `${selectedStaff.completed} nhiệm vụ`],
                ["Ngày vào làm", selectedStaff.joined],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">Đánh giá</span>
                <StarRating value={selectedStaff.rating} />
              </div>
            </div>
            <button onClick={() => setSelectedStaff(null)} className="mt-5 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
