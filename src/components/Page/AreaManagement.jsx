import { useState } from "react";
import {
  MapPin, Users, UserCheck, ChevronDown, ChevronUp, Plus,
  Search, Eye, X, Shield, Phone, Mail
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";

const AREAS = [
  {
    id: 1,
    name: "Khu vực 1A",
    district: "Quận 1",
    manager: { name: "Trần Văn Quản", phone: "0901000001", email: "quan.tran@ecoconnect.vn" },
    collectors: [
      { id: 1, name: "Nguyễn Văn An", status: "Hoạt động", completed: 120 },
      { id: 2, name: "Trần Thị Bích", status: "Hoạt động", completed: 95 },
      { id: 3, name: "Lê Quốc Dũng", status: "Nghỉ phép", completed: 40 },
    ],
    totalReports: 215,
    status: "Hoạt động",
  },
  {
    id: 2,
    name: "Khu vực 1B",
    district: "Quận 1",
    manager: { name: "Phạm Thị Liên", phone: "0901000002", email: "lien.pham@ecoconnect.vn" },
    collectors: [
      { id: 4, name: "Lê Văn Cường", status: "Hoạt động", completed: 78 },
      { id: 5, name: "Hoàng Minh Tuấn", status: "Hoạt động", completed: 63 },
    ],
    totalReports: 141,
    status: "Hoạt động",
  },
  {
    id: 3,
    name: "Khu vực 2A",
    district: "Quận 2",
    manager: { name: "Đinh Văn Hải", phone: "0901000003", email: "hai.dinh@ecoconnect.vn" },
    collectors: [
      { id: 6, name: "Phạm Minh Dũng", status: "Nghỉ phép", completed: 68 },
      { id: 7, name: "Hoàng Thị Emilia", status: "Hoạt động", completed: 55 },
      { id: 8, name: "Vũ Quốc Fang", status: "Bị khóa", completed: 22 },
    ],
    totalReports: 198,
    status: "Hoạt động",
  },
  {
    id: 4,
    name: "Khu vực 7A",
    district: "Quận 7",
    manager: { name: "Nguyễn Thị Hoa", phone: "0901000004", email: "hoa.nguyen@ecoconnect.vn" },
    collectors: [
      { id: 9, name: "Trần Quốc Bảo", status: "Hoạt động", completed: 88 },
      { id: 10, name: "Lê Thị Cúc", status: "Hoạt động", completed: 74 },
    ],
    totalReports: 162,
    status: "Hoạt động",
  },
  {
    id: 5,
    name: "Khu vực 9A",
    district: "Quận 9",
    manager: null,
    collectors: [
      { id: 11, name: "Phạm Gia Bảo", status: "Hoạt động", completed: 51 },
    ],
    totalReports: 89,
    status: "Thiếu quản lí",
  },
];

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
  const [newArea, setNewArea] = useState({ name: "", district: "", managerName: "", managerPhone: "", managerEmail: "" });

  const filtered = AREAS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.district.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  const totalCollectors = AREAS.reduce((sum, a) => sum + a.collectors.length, 0);
  const noManager = AREAS.filter(a => !a.manager).length;

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
                { label: "Tổng khu vực", value: AREAS.length, color: "text-gray-800", bg: "bg-white" },
                { label: "Đang hoạt động", value: AREAS.filter(a => a.status === "Hoạt động").length, color: "text-green-600", bg: "bg-green-50" },
                { label: "Thiếu quản lí", value: noManager, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Tổng người thu gom", value: totalCollectors, color: "text-blue-600", bg: "bg-blue-50" },
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
              {filtered.map(area => (
                <div key={area.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[area.status]}`}>{area.status}</span>
                      </div>
                      <p className="text-sm text-gray-500">{area.district}</p>
                    </div>

                    {/* Manager */}
                    <div className="flex items-center gap-3 px-6 border-l border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Quản lí</p>
                        {area.manager ? (
                          <p className="text-sm font-semibold text-gray-800">{area.manager.name}</p>
                        ) : (
                          <p className="text-sm text-amber-600 font-medium italic">Chưa có quản lí</p>
                        )}
                      </div>
                    </div>

                    {/* Staff Count */}
                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-gray-800">{area.collectors.length}</p>
                      <p className="text-xs text-gray-400">Người thu gom</p>
                    </div>

                    {/* Total Reports */}
                    <div className="px-6 border-l border-gray-100 text-center">
                      <p className="text-2xl font-bold text-green-600">{area.totalReports}</p>
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
                        onClick={() => toggle(area.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>Người thu gom</span>
                        {expandedId === area.id
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Staff List */}
                  {expandedId === area.id && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Danh sách người thu gom khu vực {area.name}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {area.collectors.map(s => (
                          <div key={s.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${staffStatusDot[s.status]}`} />
                                <span className="text-xs text-gray-500">{s.status}</span>
                              </div>
                            </div>
                            <p className="text-xs text-green-600 font-semibold shrink-0">{s.completed} HT</p>
                          </div>
                        ))}
                        {/* Add staff button */}
                        <button className="bg-white rounded-lg border border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 px-4 py-3 flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Thêm người thu gom</span>
                      </button>
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
                  <p className="text-sm text-gray-500">{selectedArea.district}</p>
                </div>
              </div>
              <button onClick={() => setSelectedArea(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Manager Info */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-indigo-600" />
                <p className="text-sm font-semibold text-indigo-700">Quản lí khu vực</p>
              </div>
              {selectedArea.manager ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                    {selectedArea.manager.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedArea.manager.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{selectedArea.manager.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        <span>{selectedArea.manager.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-amber-600 font-medium">Khu vực này chưa có quản lí</p>
                  <button className="ml-auto text-xs text-indigo-600 hover:underline">+ Gán quản lí</button>
                </div>
              )}
            </div>

            {/* Staff */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Người thu gom ({selectedArea.collectors.length} người)
              </p>
              <div className="space-y-2">
                {selectedArea.collectors.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                      {s.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-sm text-gray-800">{s.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === "Hoạt động" ? "bg-green-100 text-green-700"
                      : s.status === "Nghỉ phép" ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"
                    }`}>{s.status}</span>
                    <span className="text-xs text-green-600 font-semibold w-16 text-right">{s.completed} HT</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedArea(null)} className="mt-5 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
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
