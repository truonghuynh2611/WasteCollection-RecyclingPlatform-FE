import React, { useState, useEffect } from "react";
import { 
    getAllTeams, 
    createTeam, 
    addCollectorToTeam, 
    assignReportToTeam 
} from "../../api/team";
import { getAllAreas } from "../../api/area";
import { getAllCollectorsForAdmin } from "../../api/collector";
import { getPendingReportsForAdmin } from "../../api/waste";
import Sidebar from "../Layouts/Sidebar";
import { Plus, Users, ClipboardList, UserPlus, CheckCircle2, MapPin } from "lucide-react";

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [areas, setAreas] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [pendingReports, setPendingReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [newTeam, setNewTeam] = useState({ name: "", areaId: "" });
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [selectedCollectorId, setSelectedCollectorId] = useState("");
    const [selectedReportId, setSelectedReportId] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teamsData, areasData, collectorsData, reportsData] = await Promise.all([
                getAllTeams(),
                getAllAreas(),
                getAllCollectorsForAdmin(),
                getPendingReportsForAdmin()
            ]);
            setTeams(teamsData || []);
            setAreas(areasData || []);
            setCollectors(collectorsData || []);
            setPendingReports(reportsData || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await createTeam(newTeam);
            setNewTeam({ name: "", areaId: "" });
            fetchData();
            alert("Tạo đội thành công!");
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddCollector = async (e) => {
        e.preventDefault();
        if (!selectedTeamId || !selectedCollectorId) return;
        try {
            await addCollectorToTeam(selectedTeamId, selectedCollectorId);
            setSelectedCollectorId("");
            fetchData();
            alert("Thêm nhân viên thành công!");
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAssignReport = async (e) => {
        e.preventDefault();
        if (!selectedTeamId || !selectedReportId) return;
        try {
            await assignReportToTeam({ teamId: parseInt(selectedTeamId), reportId: parseInt(selectedReportId) });
            setSelectedReportId("");
            fetchData();
            alert("Gán báo cáo thành công!");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto p-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Quản lý đội thu gom
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Tổ chức đội ngũ và phân phối công việc hiệu quả</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Panel: Creation Forms */}
                    <div className="xl:col-span-1 space-y-8">
                        {/* Create Team Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" />
                                Tạo đội mới
                            </h2>
                            <form onSubmit={handleCreateTeam} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Tên đội</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                        placeholder="VD: Đội Thu Gom 01"
                                        value={newTeam.name}
                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Khu vực quản lý</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium appearance-none"
                                        value={newTeam.areaId}
                                        onChange={(e) => setNewTeam({ ...newTeam, areaId: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn khu vực...</option>
                                        {areas.map(area => (
                                            <option key={area.areaId} value={area.areaId}>{area.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <Plus className="w-5 h-5" />
                                    Xác nhận tạo
                                </button>
                            </form>
                        </div>

                        {/* Add Collector Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-green-500" />
                                Thêm Collector vào đội
                            </h2>
                            <form onSubmit={handleAddCollector} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Chọn đội</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                        value={selectedTeamId}
                                        onChange={(e) => setSelectedTeamId(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn đội...</option>
                                        {teams.map(team => (
                                            <option key={team.teamId} value={team.teamId}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Chọn nhân viên</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                        value={selectedCollectorId}
                                        onChange={(e) => setSelectedCollectorId(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn collector...</option>
                                        {collectors.filter(c => !c.teamId).map(col => (
                                            <option key={col.collectorId} value={col.collectorId}>{col.fullName || `User ID: ${col.userId}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Lưu thay đổi
                                </button>
                            </form>
                        </div>

                        {/* Assign Report Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-purple-500" />
                                Gán báo cáo cho đội
                            </h2>
                            <form onSubmit={handleAssignReport} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Chọn đội xử lý</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                        value={selectedTeamId}
                                        onChange={(e) => setSelectedTeamId(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn đội...</option>
                                        {teams.map(team => (
                                            <option key={team.teamId} value={team.teamId}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Chọn báo cáo chờ gán</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                        value={selectedReportId}
                                        onChange={(e) => setSelectedReportId(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn báo cáo...</option>
                                        {pendingReports.map(report => (
                                            <option key={report.reportId} value={report.reportId}>#{report.reportId} - {report.areaName} ({report.wasteType})</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <ClipboardList className="w-5 h-5" />
                                    Phân công ngay
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: Teams List */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col transition-all hover:shadow-md">
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-blue-500" />
                                    Danh sách đội hiện tại
                                </h2>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-full">
                                    {teams.length} teams
                                </span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {teams.length === 0 ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl mx-4">
                                        <Users className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="font-medium italic">Chưa có đội nào được tạo</p>
                                    </div>
                                ) : (
                                    teams.map(team => (
                                        <div key={team.teamId} className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{team.name}</h3>
                                                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                                        <MapPin className="w-4 h-4" />
                                                        {team.areaName}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl font-black text-blue-600 leading-none">{team.currentTaskCount}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nhiệm vụ</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thành viên ({team.collectors?.length || 0})</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {team.collectors && team.collectors.length > 0 ? (
                                                        team.collectors.map((c, idx) => (
                                                            <div key={`${team.teamId}-col-${c.collectorId || idx}`} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 shadow-sm flex items-center justify-between gap-2 min-w-[150px]">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${c.role === 1 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                                    <span className="truncate max-w-[100px]">{c.fullName || `Collector ${c.collectorId || idx}`}</span>
                                                                </div>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                                    c.role === 1 
                                                                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                                }`}>
                                                                    {c.role === 1 ? 'Leader' : 'Member'}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Chưa có thành viên nào</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamManagement;
