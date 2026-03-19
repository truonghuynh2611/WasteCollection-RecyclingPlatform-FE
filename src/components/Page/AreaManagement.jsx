import { useState, useEffect } from "react";
import {
  MapPin, Users, UserCheck, ChevronDown, ChevronUp, Plus,
  Search, Eye, X, Shield, Phone, Mail
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllAreas, createArea, updateArea, deleteArea } from "../../api/area";

const statusStyle = {
  "Hoạt động": "bg-green-100 text-green-700",
  "Thiếu quản lí": "bg-amber-100 text-amber-700",
  "Tạm dừng": "bg-red-100 text-red-600",
};

const staffStatusDot = {
  "Hoạt động": "bg-green-500",
  "Nghỉ phép": "bg-yellow-500",
  "Bị khóa": "bg-red-500",
};

export default function AreaManagement() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArea, setNewArea] = useState({ name: "", districtId: "", managerName: "", managerPhone: "", managerEmail: "" });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await getAllAreas();
      setAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    } finally {
      setLoading(false);
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

            {/* Header */}
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

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tổng khu vực", value: areas.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: areas.length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Thiếu quản lí", value: 0, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Tổng đội thu gom", value: totalTeams, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-gray-200 p-5 shadow-sm`}>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
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

            {/* Area Cards */}
            <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse"></div>
                ))
              ) : filtered.map(area => (
                <div key={area.areaId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Area Header Row */}
                  <div className="flex items-center gap-4 px-6 py-5">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>

                    {/* Area Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-gray-800">{area.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle["Hoạt động"]}`}>Hoạt động</span>
                      </div>
                      <p className="text-sm text-gray-500">{area.district?.districtName || "Chưa xác định"}</p>
                    </div>

                    {/* Manager */}
                    <div className="flex items-center gap-3 px-6 border-l border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Quản lí</p>
                        <p className="text-sm text-amber-600 font-medium italic">Chưa có quản lí</p>
                      </div>
                    </div>

                    {/* Team Count */}
                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-gray-800">{area.teamCount || 0}</p>
                      <p className="text-xs text-gray-400">Đội thu gom</p>
                    </div>

                    {/* Total Reports */}
                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-green-600">{area.totalReports || 0}</p>
                      <p className="text-xs text-gray-400">Báo cáo</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                      <button
                        onClick={() => setSelectedArea(area)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
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

                  {/* Expanded List (Teams instead of collectors for now) */}
                  {expandedId === area.areaId && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Danh sách đội thu gom khu vực {area.name}
                      </p>
                      <div className="text-sm text-gray-500 italic">
                        Tính năng xem chi tiết đội ngũ đang được cập nhật...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Area Detail Modal */}
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

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                Thông tin quản lí và danh sách nhân sự chi tiết đang được đồng bộ hóa từ hệ thống nhân sự.
              </p>
            </div>

            <button onClick={() => setSelectedArea(null)} className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Add Area Modal */}
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
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tên khu vực *", key: "name", placeholder: "VD: Khu vực 3B" },
                  { label: "Quận / Huyện *", key: "district", placeholder: "VD: Quận 3" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={newArea[key]}
                      onChange={e => setNewArea(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Thông tin quản lí khu vực
                </p>
                {[
                  { label: "Họ tên quản lí", key: "managerName", placeholder: "VD: Nguyễn Văn B" },
                  { label: "Số điện thoại", key: "managerPhone", placeholder: "0901..." },
                  { label: "Email", key: "managerEmail", placeholder: "manager@ecoconnect.vn" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={newArea[key]}
                      onChange={e => setNewArea(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Hủy
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Tạo khu vực
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
