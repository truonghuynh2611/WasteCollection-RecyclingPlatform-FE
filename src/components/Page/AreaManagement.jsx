import { useState, useEffect } from "react";
import {
  MapPin, Users, UserCheck, ChevronDown, ChevronUp, Plus,
  Search, Eye, X, Edit2, Trash2, UserPlus
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllAreas, createArea, updateArea, deleteArea } from "../../api/area";
import { getAllDistricts } from "../../api/district";
import { getAllTeams, assignTeamToArea, createTeam, updateTeam } from "../../api/team";
import { toast } from "react-hot-toast";

const statusStyle = {
  "Hoạt động": "bg-green-100 text-green-700",
  "Thiếu quản lí": "bg-amber-100 text-amber-700",
  "Tạm dừng": "bg-red-100 text-red-600",
};

export default function AreaManagement() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArea, setNewArea] = useState({ name: "", districtId: "" });
  const [areas, setAreas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allTeams, setAllTeams] = useState([]);
  const [assigningAreaId, setAssigningAreaId] = useState(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamType, setNewTeamType] = useState(0); // 0: Main, 1: Support
  const [unassigningTeam, setUnassigningTeam] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [areasData, districtsRes, teamsRes] = await Promise.all([
        getAllAreas(),
        getAllDistricts(),
        getAllTeams()
      ]);
      setAreas(areasData || []);
      if (districtsRes.success) {
        setDistricts(districtsRes.data);
      }
      if (teamsRes.success) {
        setAllTeams(teamsRes.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeam = async (teamId) => {
    const teamToAssign = allTeams.find(t => t.teamId === teamId);
    const targetArea = areas.find(a => a.areaId === assigningAreaId);
    const hasMainTeam = targetArea?.teams?.some(t => t.type === 0);

    if (teamToAssign?.type === 0 && hasMainTeam) {
      if (!window.confirm(`Khu vực này đã có đội chính. Bạn có muốn chuyển đội "${teamToAssign.name}" thành Đội phụ để gán vào đây không?`)) {
        return;
      }
      
      // Chuyển thành đội phụ trước khi gán
      try {
        const updateRes = await updateTeam(teamId, { 
          name: teamToAssign.name,
          type: 1 
        });
        if (!updateRes.success) {
          return toast.error("Không thể chuyển loại đội: " + updateRes.message);
        }
      } catch (error) {
        return toast.error("Lỗi khi chuyển loại đội");
      }
    }

    try {
      const res = await assignTeamToArea(teamId, assigningAreaId);
      if (res.success) {
        toast.success("Gán đội vào khu vực thành công");
        setShowAssignModal(false);
        fetchInitialData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gán đội");
    }
  };

  const handleUnassignTeam = async () => {
    if (!unassigningTeam) return;
    try {
      // Chỉ gửi các trường cần thiết để tránh lỗi 400 do dữ liệu dư thừa
      const res = await updateTeam(unassigningTeam.teamId, { 
        name: unassigningTeam.name,
        areaId: null, // Gỡ đội bằng cách đặt khu vực về null
        type: unassigningTeam.type
      });
      if (res.success) {
        toast.success("Gỡ đội khỏi khu vực thành công");
        setUnassigningTeam(null);
        fetchInitialData();
      } else {
        toast.error(res.message || "Lỗi khi gỡ đội");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gỡ đội");
    }
  };

  const handleCreateTeamForArea = async () => {
    if (!newTeamName.trim()) return toast.error("Vui lòng nhập tên đội");

    // Validation: Only one main team per area
    if (newTeamType === 0) {
      const targetArea = areas.find(a => a.areaId === assigningAreaId);
      const hasMainTeam = targetArea?.teams?.some(t => t.type === 0);
      if (hasMainTeam) {
        return toast.error(`Khu vực này đã có đội chính. Vui lòng tạo đội phụ.`);
      }
    }

    try {
      const res = await createTeam({
        name: newTeamName,
        areaId: assigningAreaId,
        type: newTeamType
      });
      if (res.success) {
        toast.success("Tạo đội và gán vào khu vực thành công");
        setShowCreateTeamModal(false);
        setNewTeamName("");
        fetchInitialData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo đội");
    }
  };

  const handleCreateArea = async () => {
    if (!newArea.name.trim() || !newArea.districtId) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }

    try {
      const res = await createArea(newArea);
      if (res.success) {
        toast.success("Tạo khu vực thành công");
        setShowAddModal(false);
        setNewArea({ name: "", districtId: "" });
        fetchInitialData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo khu vực");
    }
  };

  const handleDeleteArea = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khu vực này?")) return;
    try {
      await deleteArea(id);
      toast.success("Xóa thành công");
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa khu vực này");
    }
  };

  const filtered = areas.filter(a =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.district?.districtName || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);
  const totalTeams = areas.reduce((sum, a) => sum + (a.teamCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý khu vực</h1>
                <p className="text-gray-500 mt-1">Phân công quản lí và người thu gom theo từng khu vực</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm khu vực
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Tổng khu vực", value: areas.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: areas.length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Tổng đội thu gom", value: totalTeams, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-gray-200 p-5 shadow-sm`}>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khu vực, quận..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="text-sm text-gray-500">{filtered.length} khu vực</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse"></div>
                ))
              ) : filtered.map(area => (
                <div key={area.areaId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-gray-800">{area.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle["Hoạt động"]}`}>Hoạt động</span>
                      </div>
                      <p className="text-sm text-gray-500">{area.district?.districtName || "Chưa xác định"}</p>
                    </div>

                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-gray-800">{area.teamCount || 0}</p>
                      <p className="text-xs text-gray-400">Đội thu gom</p>
                    </div>

                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-green-600">{area.totalReports || 0}</p>
                      <p className="text-xs text-gray-400">Báo cáo</p>
                    </div>

                    <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                      <button
                        onClick={() => setSelectedArea(area)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.areaId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggle(area.areaId)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>Đội thu gom</span>
                        {expandedId === area.areaId
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {expandedId === area.areaId && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Đội thu gom tại {area.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const hasMain = area.teams?.some(t => t.type === 0);
                              setAssigningAreaId(area.areaId);
                              setNewTeamType(hasMain ? 1 : 0);
                              setShowCreateTeamModal(true);
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            {area.teams?.some(t => t.type === 0) ? "Tạo Đội phụ" : "Tạo Đội mới"}
                          </button>
                          <button
                            onClick={() => {
                              setAssigningAreaId(area.areaId);
                              setShowAssignModal(true);
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                          >
                            <UserPlus className="w-3 h-3" />
                            {area.teams?.some(t => t.type === 0) ? "Gán Đội phụ" : "Gán Đội"}
                          </button>
                        </div>
                      </div>
                      {area.teams && area.teams.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {area.teams.map(team => (
                            <div key={team.teamId} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:border-indigo-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${team.type === 1 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {team.type === 1 ? 'P' : 'C'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-700">{team.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium lowercase tracking-tighter">
                                    {team.type === 1 ? 'Đội phụ' : 'Đội chính'} • #{team.teamId}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-sm font-black ${(team.totalReports || 0) >= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                      {team.totalReports || 0}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Reports</span>
                                  </div>
                                  {(team.totalReports || 0) >= 5 && team.type === 0 && (
                                    <p className="text-[9px] text-red-500 font-bold animate-pulse mt-0.5 uppercase">Quá tải - Chuyển phụ</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => setUnassigningTeam(team)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Gỡ khỏi khu vực"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Khu vực này chưa có đội thu gom.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {unassigningTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận gỡ đội</h3>
            <p className="text-sm text-gray-500 mb-8">
              Bạn có chắc chắn muốn gỡ đội <span className="font-bold text-gray-800">"{unassigningTeam.name}"</span> khỏi khu vực này không?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUnassigningTeam(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleUnassignTeam}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Gỡ đội
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedArea && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedArea(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedArea.name}</h3>
                  <p className="text-sm text-gray-500">{selectedArea.district?.districtName || "Chưa xác định"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedArea(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Mã khu vực</span>
                <span className="font-semibold text-gray-800">#{selectedArea.areaId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Số đội thu gom</span>
                <span className="font-semibold text-blue-600">{selectedArea.teamCount || 0} đội</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Tổng báo cáo</span>
                <span className="font-semibold text-green-600">{selectedArea.totalReports || 0}</span>
              </div>
            </div>

            <button onClick={() => setSelectedArea(null)} className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Thêm khu vực mới</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khu vực *</label>
                <input
                  type="text"
                  placeholder="VD: Khu vực 3B"
                  value={newArea.name}
                  onChange={e => setNewArea({ ...newArea, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện *</label>
                <select
                  value={newArea.districtId}
                  onChange={e => setNewArea({ ...newArea, districtId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Chọn Quận / Huyện</option>
                  {districts.map(d => (
                    <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Hủy
              </button>
              <button
                onClick={handleCreateArea}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Tạo khu vực
              </button>
            </div>
          </div>
        </div>
      )}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Gán Đội vào khu vực
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đội..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={teamSearch}
                  onChange={e => setTeamSearch(e.target.value)}
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {allTeams
                  .filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
                  .map(team => (
                    <div
                      key={team.teamId}
                      className="p-3 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">{team.name}</p>
                        <p className="text-xs text-gray-400">Đang ở: {areas.find(a => a.areaId === team.areaId)?.name || "Chưa gán"}</p>
                      </div>
                      <button
                        onClick={() => handleAssignTeam(team.teamId)}
                        disabled={team.areaId === assigningAreaId}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${team.areaId === assigningAreaId
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100"
                          }`}
                      >
                        {team.areaId === assigningAreaId ? "Đã ở đây" : "Gán"}
                      </button>
                    </div>
                  ))}

                {allTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase())).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Không tìm thấy đội nào</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Tạo Đội mới cho khu vực
              </h3>
              <button
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setNewTeamName("");
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Đội *</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="VD: Đội Đặc Nhiệm 1..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-gray-400 italic">Đội mới sẽ được gán trực tiếp vào khu vực này.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại Đội *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTeamType(0)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${newTeamType === 0 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                    >
                      Đội Chính
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTeamType(1)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${newTeamType === 1 
                        ? 'bg-amber-50 border-amber-500 text-amber-700' 
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                    >
                      Đội Phụ
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowCreateTeamModal(false);
                    setNewTeamName("");
                  }}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-sm transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateTeamForArea}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  Tạo & Gán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
