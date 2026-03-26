import { useState, useEffect } from "react";
import {
  Users, Plus, Search, Edit2, Trash2, X, Shield, User,
  ChevronDown, MapPin, Briefcase, UserCheck, Star, UserPlus
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllTeams, createTeam, updateTeam, deleteTeam, setLeader, removeLeader, getAllCollectors, addCollectorToTeam } from "../../api/team";
import { getAllAreas } from "../../api/area";
import { toast } from "react-hot-toast";

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: "", areaId: "" });

  // New state for member assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetTeam, setAssignTargetTeam] = useState(null);
  const [allCollectors, setAllCollectors] = useState([]);
  const [assignSearch, setAssignSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, areasRes] = await Promise.all([
        getAllTeams(),
        getAllAreas()
      ]);
      if (teamsRes.success) setTeams(teamsRes.data);
      setAreas(areasRes || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (team = null) => {
    setEditingTeam(team);
    setFormData({
      name: team ? team.name : "",
      areaId: team ? team.areaId : (areas.length > 0 ? areas[0].areaId : "")
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Vui lòng nhập tên đội");
    if (!formData.areaId) return toast.error("Vui lòng chọn khu vực");

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.teamId, formData);
        toast.success("Cập nhật thành công");
      } else {
        await createTeam(formData);
        toast.success("Thêm đội mới thành công");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đội này?")) return;
    try {
      await deleteTeam(id);
      toast.success("Xóa thành công");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa đội này");
    }
  };

  const handleToggleLeader = async (teamId, collectorId, isCurrentLeader) => {
    try {
      if (isCurrentLeader) {
        await removeLeader(teamId, collectorId);
        toast.success("Đã gỡ chức vụ trưởng nhóm");
      } else {
        await setLeader(teamId, collectorId);
        toast.success("Đã thiết lập trưởng nhóm thành công");
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thay đổi chức vụ");
    }
  };

  const handleOpenAssignModal = async (team) => {
    try {
      setAssignTargetTeam(team);
      const res = await getAllCollectors();
      if (res.success) {
        setAllCollectors(res.data);
      }
      setShowAssignModal(true);
    } catch (error) {
      toast.error("Không thể tải danh sách người thu gom");
    }
  };

  const handleAssignMember = async (collectorId) => {
    try {
      const res = await addCollectorToTeam({
        teamId: assignTargetTeam.teamId,
        collectorId: collectorId
      });
      if (res.success) {
        toast.success("Gán thành viên thành công");
        setShowAssignModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gán thành viên");
    }
  };

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Đội ngũ</h1>
                <p className="text-gray-500 mt-1">Quản lý các đội thu gom và phân công trưởng nhóm</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Tạo Đội mới
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đội..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} đội</span>
            </div>

            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))
              ) : filtered.map(team => (
                <div key={team.teamId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
                  <div className="p-6 flex items-center justify-between bg-white border-b border-gray-50 group-hover:bg-indigo-50/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium">
                            #{team.teamId} • {areas.find(a => a.areaId === team.areaId)?.name || `Area ID: ${team.areaId}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(team)}
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(team.teamId)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thành viên đội ({team.collectors?.length || 0})</h4>
                      <button
                        onClick={() => handleOpenAssignModal(team)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" /> Gán thành viên
                      </button>
                    </div>

                    {team.collectors && team.collectors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {team.collectors.map(member => (
                          <div key={member.collectorId} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group/member">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${member.role === 'Leader' ? 'bg-amber-500 shadow-lg shadow-amber-100' : 'bg-indigo-400'}`}>
                                {member.fullName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{member.fullName}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-tighter ${member.role === 'Leader' ? 'text-amber-600' : 'text-gray-400'}`}>
                                  {member.role === 'Leader' ? 'Trưởng nhóm' : 'Thành viên'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleLeader(team.teamId, member.collectorId, member.role === 'Leader')}
                              className={`p-2 rounded-lg transition-all ${member.role === 'Leader'
                                  ? 'bg-amber-50 text-amber-600 opacity-100'
                                  : 'text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover/member:opacity-100'
                                }`}
                              title={member.role === 'Leader' ? "Gỡ chức Trưởng nhóm" : "Thiết lập Trưởng nhóm"}
                            >
                              <Shield className={`w-4 h-4 ${member.role === 'Leader' ? 'fill-amber-500/20' : ''}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-400 italic">Đội chưa có thành viên. Hãy gán người thu gom vào đội này.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy đội nào</h3>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingTeam ? "Cập nhật Đội" : "Tạo Đội mới"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Đội</label>
                  <input
                    type="text"
                    placeholder="VD: Đội Cơ Động 1..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Khu vực quản lý</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={formData.areaId}
                      onChange={e => setFormData({ ...formData, areaId: e.target.value })}
                    >
                      <option value="">Chọn khu vực</option>
                      {areas.map(area => (
                        <option key={area.areaId} value={area.areaId}>{area.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
                  >
                    {editingTeam ? "Cập nhật" : "Tạo Đội"}
                  </button>
                </div>
              </form>
            </div>
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Gán thành viên vào đội</h3>
                <p className="text-sm text-gray-500 mt-1">{assignTargetTeam?.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                  value={assignSearch}
                  onChange={e => setAssignSearch(e.target.value)}
                />
              </div>

              <div className="overflow-y-auto max-h-[400px] space-y-2 pr-2 custom-scrollbar">
                {allCollectors
                  .filter(c =>
                    (c.fullName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(assignSearch.toLowerCase())) &&
                    c.teamId !== assignTargetTeam?.teamId
                  )
                  .map(member => (
                    <div key={member.collectorId} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-indigo-300 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{member.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            Đang ở: {teams.find(t => t.teamId === member.teamId)?.name || 'Không có đội'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignMember(member.collectorId)}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                      >
                        Gán vào đội
                      </button>
                    </div>
                  ))}

                {allCollectors.filter(c => c.teamId !== assignTargetTeam?.teamId).length === 0 && (
                  <div className="text-center py-10 text-gray-400 italic text-sm">
                    Không có nhân viên khả dụng để gán.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
