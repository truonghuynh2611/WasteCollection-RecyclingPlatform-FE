import { useState, useEffect } from "react";
import { Search, UserPlus, Eye, Lock, Unlock, ChevronDown, Briefcase, Star, X } from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllCollectors, createCollector, getAllTeams } from "../../api/team";
import { toast } from "react-hot-toast";

function StarRating({ value }) {
  const roundedValue = Math.round(value || 4.5);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= roundedValue ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{value || 4.5}</span>
    </div>
  );
}

export default function CollectorManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollector, setNewCollector] = useState({
    fullName: "",
    email: "",
    password: "Password123!",
    phone: "",
    teamId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [collectorsRes, teamsRes] = await Promise.all([
        getAllCollectors(),
        getAllTeams()
      ]);
      if (collectorsRes.success) setStaff(collectorsRes.data);
      if (teamsRes.success) setTeams(teamsRes.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu người thu gom");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollector = async (e) => {
    e.preventDefault();
    if (!newCollector.fullName || !newCollector.email || !newCollector.teamId) {
      return toast.error("Vui lòng điền các trường bắt buộc");
    }

    try {
      const res = await createCollector(newCollector);
      if (res.success) {
        toast.success("Tạo người thu gom thành công");
        setShowAddModal(false);
        setNewCollector({ fullName: "", email: "", password: "Password123!", phone: "", teamId: "" });
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo tài khoản");
    }
  };

  const filtered = staff.filter(s => {
    const teamName = teams.find(t => t.teamId === s.teamId)?.name || "";
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                       teamName.toLowerCase().includes(search.toLowerCase());
    const statusText = s.status ? "Hoạt động" : "Bị khóa";
    const matchStatus = filterStatus === "Tất cả" || statusText === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusStyle = { 
    "Hoạt động": "bg-green-100 text-green-700", 
    "Bị khóa": "bg-red-100 text-red-600" 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý người thu gom</h1>
                <p className="text-gray-500 mt-1">Quản lý đội ngũ người thu gom rác theo khu vực</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Thêm người thu gom
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tổng người thu gom", value: staff.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: staff.filter(s => s.status).length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Bị khóa", value: staff.filter(s => !s.status).length, color: "text-red-600", bg: "bg-red-50" },
                { label: "Tổng team", value: teams.length, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-gray-200 p-5 shadow-sm`}>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

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
                  <option>Bị khóa</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500 ml-auto">{filtered.length} người thu gom</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse" />
                ))
              ) : filtered.map(s => {
                const team = teams.find(t => t.teamId === s.teamId);
                const statusText = s.status ? "Hoạt động" : "Bị khóa";
                return (
                  <div key={s.collectorId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${s.role === 'Leader' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                          {s.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{s.fullName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{team?.name || "Chưa thêm vào đội"}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusStyle[statusText]}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Vai trò</span>
                        <span className={`font-bold text-[10px] uppercase ${s.role === 'Leader' ? 'text-amber-600' : 'text-gray-400'}`}>
                          {s.role === 'Leader' ? "Trưởng nhóm" : "Thành viên"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Đánh giá</span>
                        <StarRating value={s.rating} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Email</span>
                        <span className="text-gray-700 font-medium truncate ml-4 block">{s.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => setSelectedStaff(s)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStaff(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${selectedStaff.role === 'Leader' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                {selectedStaff.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedStaff.fullName}</h3>
                <p className="text-sm text-gray-500">{selectedStaff.email}</p>
                <p className="text-xs text-amber-600 font-bold uppercase mt-1">{selectedStaff.role}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                ["User ID", `#${selectedStaff.userId}`],
                ["Collector ID", `#${selectedStaff.collectorId}`],
                ["SĐT", selectedStaff.phone || "Chưa cập nhật"],
                ["Team", teams.find(t => t.teamId === selectedStaff.teamId)?.name || "N/A"],
                ["Trạng thái", selectedStaff.status ? "Hoạt động" : "Bị khóa"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            
            <button onClick={() => setSelectedStaff(null)} className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Tạo tài khoản người thu gom</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddCollector} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={newCollector.fullName}
                  onChange={e => setNewCollector({ ...newCollector, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="collector@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={newCollector.email}
                  onChange={e => setNewCollector({ ...newCollector, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="0912345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={newCollector.phone}
                  onChange={e => setNewCollector({ ...newCollector, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thêm vào Đội</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={newCollector.teamId}
                  onChange={e => setNewCollector({ ...newCollector, teamId: e.target.value })}
                >
                  <option value="">Chọn đội thu gom</option>
                  {teams.map(t => (
                    <option key={t.teamId} value={t.teamId}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm">
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
