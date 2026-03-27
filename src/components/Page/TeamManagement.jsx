import { useState, useEffect } from "react";
import {
  Users, Plus, Search, Edit2, Trash2, X, Shield, User,
  ChevronDown, MapPin, Briefcase, UserCheck, Star, UserPlus, AlertCircle, CheckCircle2
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllTeams, createTeam, updateTeam, deleteTeam, setLeader, removeLeader, getAllCollectors, addCollectorToTeam } from "../../api/team";
import { getAllAreas } from "../../api/area";
import { getAllDistricts } from "../../api/district";
import { toast } from "react-hot-toast";

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [areas, setAreas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
<<<<<<< HEAD
  const [formData, setFormData] = useState({ name: "" });
=======
  const [formData, setFormData] = useState({ name: "", areaId: "", type: 0 });
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24

  // State for Leader/Member selection in create modal
  const [availableCollectors, setAvailableCollectors] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  // State for member assignment modal (existing)
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
      const [teamsRes, areasRes, districtsRes] = await Promise.all([
        getAllTeams(),
        getAllAreas(),
        getAllDistricts()
      ]);
      if (teamsRes.success) setTeams(teamsRes.data);
      setAreas(areasRes || []);
      if (districtsRes?.data) setDistricts(districtsRes.data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (team = null) => {
    setEditingTeam(team);
    setFormData({
<<<<<<< HEAD
      name: team ? team.name : ""
=======
      name: team ? team.name : "",
      areaId: team ? team.areaId : "",
      type: team ? team.type : 0
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
    });
    setSelectedLeader("");
    setSelectedMembers([]);
    setSelectedDistrictId("");
    setMemberSearch("");

    // Fetch available collectors (those without a team)
    if (!team) {
      try {
        const res = await getAllCollectors();
        if (res.success) {
          const free = res.data.filter(c => !c.teamId);
          setAvailableCollectors(free);
        }
      } catch { /* ignore */ }
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Vui lòng nhập tên đội");

    if (!editingTeam) {
      if (!selectedLeader) return toast.error("Vui lòng chọn 1 Leader");
      if (selectedMembers.length !== 2) return toast.error("Vui lòng chọn đúng 2 thành viên (Member)");
    }

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.teamId, formData);
        toast.success("Cập nhật thành công");
      } else {
        const res = await createTeam(formData);
        const newTeamId = res?.data?.teamId;
        toast.success("Thêm đội mới thành công");

        // Assign selected leader and members after team creation
        if (newTeamId) {
          // Assign leader first (add as member, then promote)
          if (selectedLeader) {
            try {
              await addCollectorToTeam({ teamId: newTeamId, collectorId: parseInt(selectedLeader) });
              await setLeader(newTeamId, parseInt(selectedLeader));
            } catch (err) {
              toast.error(`Lỗi gán leader: ${err.response?.data?.message || err.message}`);
            }
          }
          // Assign members
          for (const memberId of selectedMembers) {
            if (memberId.toString() === selectedLeader) continue;
            try {
              await addCollectorToTeam({ teamId: newTeamId, collectorId: parseInt(memberId) });
            } catch (err) {
              toast.error(`Lỗi gán thành viên: ${err.response?.data?.message || err.message}`);
            }
          }
        }
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  const toggleMember = (collectorId) => {
    setSelectedMembers(prev =>
      prev.includes(collectorId)
        ? prev.filter(id => id !== collectorId)
        : [...prev, collectorId]
    );
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

  const handleRemoveMember = async (teamId, collectorId) => {
    if (!window.confirm("Bạn có chắc muốn gỡ nhân viên này khỏi đội?")) return;
    try {
      await removeCollectorFromTeam({ teamId, collectorId });
      toast.success("Đã gỡ thành viên khỏi đội");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gỡ thành viên");
    }
  };

  const handleOpenAssignModal = async (team) => {
    try {
      setAssignTargetTeam(team);
      const res = await getAllCollectors();
      if (res.success) {
        const collectorsWithRoles = res.data.map(c => ({
          ...c,
          selectedRole: c.role !== undefined ? c.role : 0
        }));
        setAllCollectors(collectorsWithRoles);
      }
      setShowAssignModal(true);
    } catch (error) {
      toast.error("Không thể tải danh sách người thu gom");
    }
  };

  const handleAssignMember = async (collectorId, role) => {
    try {
      const res = await addCollectorToTeam({
        teamId: assignTargetTeam.teamId,
        collectorId: collectorId,
        role: parseInt(role)
      });
      if (res.success) {
<<<<<<< HEAD
        toast.success("Thêm thành viên thành công");
        setShowAssignModal(false);
=======
        toast.success("Gán thành viên thành công");
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
        fetchData();
        handleOpenAssignModal(assignTargetTeam);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gán thành viên");
    }
  };

  // Helper: get area coverage info
  const getAreaCoverage = (areaId) => {
    const areaTeams = teams.filter(t => t.areaId === areaId);
    return {
      count: areaTeams.length,
      hasMain: areaTeams.some(t => t.type === 0),
      hasSupport: areaTeams.some(t => t.type === 1),
    };
  };

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="w-full">
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
              ) : filtered.map(team => {
                const leader = team.collectors?.find(c => c.role === 'Leader');
                const members = team.collectors?.filter(c => c.role !== 'Leader') || [];
                const areaName = areas.find(a => a.areaId === team.areaId)?.name || 'Chưa gán khu vực';
                const coverage = getAreaCoverage(team.areaId);

                return (
                <div key={team.teamId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
                  {/* Header */}
                  <div className="p-6 flex items-center justify-between border-b border-gray-50 group-hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
<<<<<<< HEAD
                        <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-medium">
                            #{team.teamId} • {team.areaName || "Chưa gán khu vực"}
=======
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                            team.type === 0 ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {team.type === 0 ? "Đội Chính" : "Đội Phụ"}
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
                          </span>
                          {team.areaId && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${team.type === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {team.type === 1 ? 'Đội Phụ' : 'Đội Chính'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-xs font-bold text-gray-700">{areaName}</span>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            coverage.count >= 2 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {coverage.count >= 2 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {coverage.count}/2 Team
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(team)}
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(team.teamId)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Leader + Members */}
                  <div className="p-6 bg-gray-50/30">
<<<<<<< HEAD
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thành viên đội ({team.collectors?.length || 0})</h4>
                      <button
                        onClick={() => handleOpenAssignModal(team)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" /> Thêm thành viên
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
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleLeader(team.teamId, member.collectorId, member.role === 'Leader')}
                                className={`p-2 rounded-lg transition-all ${member.role === 'Leader'
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'text-gray-300 hover:text-amber-600 hover:bg-amber-50'
                                  }`}
                                title={member.role === 'Leader' ? "Gỡ chức Trưởng nhóm" : "Cử làm Trưởng nhóm"}
                              >
                                <Shield className={`w-4 h-4 ${member.role === 'Leader' ? 'fill-amber-500/20' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleRemoveMember(team.teamId, member.collectorId)}
                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Gỡ khỏi đội"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
=======
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Leader */}
                      <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Trưởng Nhóm (Leader)</h4>
                        {leader ? (
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-100">
                              {leader.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-800 truncate">{leader.fullName}</p>
                              <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase">
                                <Star className="w-2.5 h-2.5 fill-amber-500" /> Leader
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleLeader(team.teamId, leader.collectorId, true)}
                              className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                              title="Gỡ chức Trưởng nhóm"
                            >
                              <Shield className="w-4 h-4 fill-amber-500/20" />
                            </button>
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(team)}
                            className="w-full py-4 border border-dashed border-amber-200 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" /> Gán trưởng nhóm
                          </button>
                        )}
                      </div>
<<<<<<< HEAD
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-400 italic">Đội chưa có thành viên. Hãy thêm người thu gom vào đội này.</p>
=======

                      {/* Members */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành viên ({members.length})</h4>
                          <button
                            onClick={() => handleOpenAssignModal(team)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                          >
                            <UserPlus className="w-3 h-3" /> Gán thành viên
                          </button>
                        </div>
                        {members.length > 0 ? (
                          <div className="space-y-2">
                            {members.map(member => (
                              <div key={member.collectorId} className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 flex items-center justify-between group/member">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-400 text-white flex items-center justify-center font-bold text-xs">
                                    {member.fullName.charAt(0)}
                                  </div>
                                  <p className="text-sm font-medium text-gray-800">{member.fullName}</p>
                                </div>
                                <button
                                  onClick={() => handleToggleLeader(team.teamId, member.collectorId, false)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover/member:opacity-100 transition-all"
                                  title="Thiết lập Trưởng nhóm"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl">
                            <p className="text-xs text-gray-400 italic">Chưa có thành viên</p>
                          </div>
                        )}
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
                      </div>
                    </div>
                  </div>
                </div>
              )})}
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

      {/* ===== Modal Tạo / Cập nhật Đội ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden transform transition-all flex flex-col max-h-[90vh] ${!editingTeam ? 'max-w-4xl' : 'max-w-lg'}`}>
            {/* Header */}
            <div className="px-8 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
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

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className={`p-6 ${!editingTeam ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-5'}`}>

                {/* ===== LEFT COLUMN: Team Info ===== */}
                <div className="space-y-5">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại hình Đội *</label>
                    <div className="flex gap-2">
                      {[{ id: 0, label: "Đội Chính" }, { id: 1, label: "Đội Phụ" }].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            formData.type === type.id
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin khu vực</p>
                    
                    {/* Quận/Huyện */}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quận/Huyện *</label>
                    <div className="relative mb-3">
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={selectedDistrictId}
                        onChange={e => {
                          setSelectedDistrictId(e.target.value);
                          setFormData({ ...formData, areaId: "" });
                        }}
                      >
                        <option value="">-- Chọn quận/huyện --</option>
                        {districts.map(d => (
                          <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Khu vực (filtered by district) */}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Khu vực bàn giao *</label>
                    <div className="relative mb-3">
                      <select
                        required
                        disabled={!selectedDistrictId}
                        className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${!selectedDistrictId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={formData.areaId}
                        onChange={e => setFormData({ ...formData, areaId: e.target.value })}
                      >
                        <option value="">{selectedDistrictId ? '-- Chọn khu vực --' : '-- Chọn quận trước --'}</option>
                        {areas
                          .filter(area => selectedDistrictId ? area.districtId === parseInt(selectedDistrictId) : true)
                          .map(area => {
                            const cov = getAreaCoverage(area.areaId);
                            return <option key={area.areaId} value={area.areaId}>{area.name} ({cov.count}/2 team)</option>;
                          })}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {formData.areaId && (() => {
                      const cov = getAreaCoverage(formData.areaId);
                      const isFull = cov.count >= 2;
                      return (
                        <div className={`p-3 rounded-xl border ${isFull ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className={`w-3.5 h-3.5 ${isFull ? 'text-green-600' : 'text-amber-600'}`} />
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isFull ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                              {isFull ? 'Đã đủ' : `Thiếu ${2 - cov.count} team`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${cov.hasMain ? 'bg-white border-green-200' : 'bg-white/50 border-dashed border-gray-300'}`}>
                              <Users className={`w-3.5 h-3.5 ${cov.hasMain ? 'text-green-600' : 'text-gray-300'}`} />
                              <span className={`font-bold ${cov.hasMain ? 'text-green-700' : 'text-gray-400'}`}>Chính: {cov.hasMain ? '✓' : '✕'}</span>
                            </div>
                            <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${cov.hasSupport ? 'bg-white border-green-200' : 'bg-white/50 border-dashed border-gray-300'}`}>
                              <Shield className={`w-3.5 h-3.5 ${cov.hasSupport ? 'text-green-600' : 'text-gray-300'}`} />
                              <span className={`font-bold ${cov.hasSupport ? 'text-green-700' : 'text-gray-400'}`}>Phụ: {cov.hasSupport ? '✓' : '✕'}</span>
                            </div>
                          </div>
                          {isFull && <p className="mt-2 text-[10px] font-bold text-amber-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Khu vực đã đủ 2 đội.</p>}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ===== RIGHT COLUMN: Leader & Members ===== */}
                {!editingTeam && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Phân công nhân sự</p>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Trưởng nhóm (Leader)</label>
                      <div className="relative">
                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20" value={selectedLeader} onChange={e => { setSelectedLeader(e.target.value); if (e.target.value) setSelectedMembers(prev => prev.filter(id => id.toString() !== e.target.value)); }}>
                          <option value="">-- Chọn trưởng nhóm (tùy chọn) --</option>
                          {availableCollectors.map(c => <option key={c.collectorId} value={c.collectorId}>{c.fullName} ({c.email})</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {selectedLeader && (() => {
                        const leader = availableCollectors.find(c => c.collectorId.toString() === selectedLeader);
                        return leader ? (
                          <div className="flex items-center gap-2 mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">{leader.fullName.charAt(0)}</div>
                            <span className="text-xs font-bold text-gray-800">{leader.fullName}</span>
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500 ml-auto" />
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Thành viên ({selectedMembers.length} đã chọn)</label>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input type="text" placeholder="Tìm theo tên..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                      </div>
                      <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1">
                        {availableCollectors
                          .filter(c => c.collectorId.toString() !== selectedLeader)
                          .filter(c => c.fullName?.toLowerCase().includes(memberSearch.toLowerCase()))
                          .map(c => {
                            const isSelected = selectedMembers.includes(c.collectorId);
                            return (
                              <button key={c.collectorId} type="button" onClick={() => toggleMember(c.collectorId)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                  {isSelected && <span className="text-white text-[10px] font-black">✓</span>}
                                </div>
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">{c.fullName?.charAt(0)}</div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-gray-800 truncate">{c.fullName}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                                </div>
                              </button>
                            );
                          })}
                        {availableCollectors.filter(c => c.collectorId.toString() !== selectedLeader).length === 0 && (
                          <p className="text-center text-xs text-gray-400 italic py-4">Không có nhân viên khả dụng</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

<<<<<<< HEAD
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
=======
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm transition-all">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all">{editingTeam ? "Cập nhật" : "Tạo Đội"}</button>
              </div>
            </form>
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 shrink-0" />
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
          </div>
        </div>
      )}

      {/* ===== Modal Gán Thành viên ===== */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Thêm thành viên vào đội</h3>
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
<<<<<<< HEAD
                  .filter(c =>
                    (c.fullName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(assignSearch.toLowerCase())) &&
                    c.teamId === null
                  )
=======
                  .filter(c => {
                    const matchesSearch = c.fullName?.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                         c.userId?.toString().includes(assignSearch);
                    return matchesSearch;
                  })
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
                  .map(member => (
                    <div key={member.collectorId} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-indigo-300 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {member.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{member.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {member.teamId ? `Đang ở: ${teams.find(t => t.teamId === member.teamId)?.name || 'Đội khác'}` : 'Chưa có đội'}
                          </p>
                        </div>
                      </div>
<<<<<<< HEAD
                      <button
                        onClick={() => handleAssignMember(member.collectorId)}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                      >
                        Thêm vào đội
                      </button>
                    </div>
                  ))}

                {allCollectors.filter(c => c.teamId === null).length === 0 && (
                  <div className="text-center py-10 text-gray-400 italic text-sm">
                    Không có nhân viên thu gom tự do nào khả dụng.
=======
                      <div className="flex items-center gap-2">
                        <select
                          className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          value={member.selectedRole}
                          onChange={(e) => {
                            const newRole = parseInt(e.target.value);
                            setAllCollectors(prev => prev.map(c =>
                              c.collectorId === member.collectorId ? { ...c, selectedRole: newRole } : c
                            ));
                          }}
                        >
                          <option value="0">Thành viên</option>
                          <option value="1">Trưởng nhóm</option>
                        </select>
                        <button
                          onClick={() => handleAssignMember(member.collectorId, member.selectedRole)}
                          className="px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Gán
                        </button>
                      </div>
                    </div>
                  ))}

                {allCollectors.filter(c => c.teamId === null || c.teamId === 0).length === 0 && !assignSearch && (
                  <div className="text-center py-10 text-gray-400 italic text-sm">
                    Hiện tại không có nhân viên nào đang trống.
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
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
