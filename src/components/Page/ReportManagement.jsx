import {
  Search, Bell, Filter, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, UserCheck, MapPin, Calendar, Tag, User
} from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../Layouts/Sidebar";
import ManagerSidebar from "../Manager/ManagerSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { getWasteReports } from "../../api/waste";

const tabs = [
  { id: "all", label: "Tất cả", count: null },
  { id: "pending", label: "Chờ xử lý", count: null },
  { id: "assigned", label: "Đã phân công", count: null },
  { id: "collecting", label: "Đang thu gom", count: null },
  { id: "completed", label: "Đã hoàn thành", count: null },
];

const statusColors = {
  "Pending": "bg-yellow-100 text-yellow-700",
  "Assigned": "bg-blue-100 text-blue-700",
  "Collected": "bg-purple-100 text-purple-700",
  "Completed": "bg-green-100 text-green-700",
  "Cancelled": "bg-red-100 text-red-700",
};

const statusLabels = {
  "Pending": "Đang chờ",
  "Assigned": "Đã phân công",
  "Collected": "Đang thu gom",
  "Completed": "Đã hoàn thành",
  "Cancelled": "Đã hủy",
};

const MANAGER_LIST = [
  "Quản lý Khu vực 1",
  "Quản lý Khu vực 2",
  "Quản lý Khu vực 3",
];

const COLLECTOR_LIST = [
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Văn Cường",
  "Phạm Minh Dũng", "Hoàng Thị Emilia", "Vũ Quốc Fang",
];

/* ─── Modal: Xem chi tiết ─── */
function ViewModal({ item, statusColors, statusLabels, onClose, onEdit }) {
  if (!item) return null;
  
  // Base URL for images
  const API_BASE_URL = "https://localhost:7082"; // Cần kiểm tra lại port chính xác của BE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg bg-blue-100 text-blue-600`}>
              {item.citizen?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{item.citizen?.fullName}</h3>
              <p className="text-sm text-gray-400">#REQ-{item.reportId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status */}
        <div className="flex justify-center mb-5">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
            {statusLabels[item.status] || item.status}
          </span>
        </div>

        {/* Images section */}
        {item.reportImages && item.reportImages.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase">Hình ảnh đính kèm</p>
            <div className="grid grid-cols-2 gap-2">
              {item.reportImages.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img.imageUrl.startsWith('http') ? img.imageUrl : `${API_BASE_URL}${img.imageUrl}`} 
                  alt="Waste" 
                  className="w-full h-32 object-cover rounded-xl border border-gray-100"
                />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <Tag className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Loại rác</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>
                {item.wasteType}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Mô tả / Vị trí</p>
              <p className="text-sm text-gray-800">{item.description || "Không có mô tả"}</p>
              <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                {item.area?.areaName || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <Calendar className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Ngày gửi</p>
              <p className="text-sm text-gray-800">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <User className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Phân công cho Team</p>
              {item.teamId ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                    T
                  </div>
                  <span className="text-sm text-gray-800">Team {item.teamId}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Chưa phân công</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => { onClose(); onEdit(item); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" /> Chỉnh sửa
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Chỉnh sửa ─── */
function EditModal({ form, setForm, statusColors, statusLabels, onSave, onClose }) {
  if (!form) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa yêu cầu</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description || ""}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-500" /> Team xử lý (ID)
            </label>
            <input
              type="number"
              value={form.teamId || ""}
              onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}
              placeholder="Nhập ID Team..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {Object.keys(statusLabels).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Hủy</button>
          <button onClick={onSave} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Xác nhận xóa ─── */
function DeleteModal({ target, data, onConfirm, onClose }) {
  if (!target) return null;
  const row = data.find(r => r.reportId === target);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-gray-500 mb-6">
          Bạn có chắc muốn xóa yêu cầu <span className="font-semibold">#REQ-{row?.reportId}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">Xóa</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
const ReportManagement = () => {
  const { isManager, isAdmin } = useAuth();
  const CurrentSidebar = isManager() ? ManagerSidebar : Sidebar;

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewItem, setViewItem]       = useState(null);
  const [editForm, setEditForm]       = useState(null);
  const [editId, setEditId]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getWasteReports();
        setData(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const openEdit = (row) => { setEditId(row.reportId); setEditForm({ ...row }); };
  const saveEdit = () => {
    setData(prev => prev.map(r => r.reportId === editId ? { ...editForm } : r));
    setEditId(null); setEditForm(null);
    // Lưu ý: Đây chỉ là cập nhật UI, thực tế cần gọi API PUT /WasteReport
  };
  const confirmDelete = () => {
    setData(prev => prev.filter(r => r.reportId !== deleteTarget));
    setDeleteTarget(null);
    // Lưu ý: Thực tế cần gọi API DELETE /WasteReport/{id}
  };

  const filteredData = data.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return item.status === "Pending";
    if (activeTab === "assigned") return item.status === "Assigned";
    if (activeTab === "collecting") return item.status === "Collected";
    if (activeTab === "completed") return item.status === "Completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CurrentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm yêu cầu, địa điểm..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-8">
              <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{isAdmin() ? "Hệ thống Admin" : "Quản lý khu vực"}</p>
                  <p className="text-xs text-gray-500 text-indigo-600 font-medium">{isAdmin() ? "Administrator" : "Area Manager"}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  DA
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {isAdmin() ? "Điều phối yêu cầu (Admin)" : "Quản lý thu gom khu vực (Manager)"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdmin() 
                  ? "Admin thực hiện phân phối yêu cầu cho các Quản lý khu vực (Area Manager)" 
                  : "Quản lý thực hiện phân công công việc cụ thể cho nhân viên thu gom (Staff/Collector)"}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex items-center gap-6 px-6 min-w-max">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 text-sm transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-green-500 text-green-600 font-medium"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "pending" && data.filter(i => i.status === "Pending").length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                          {data.filter(i => i.status === "Pending").length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" /> Lọc theo loại rác
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Người báo cáo", "Loại rác", "Địa chỉ / Mô tả", "Khu vực", "Ngày gửi", "Team xử lý", "Trạng thái", "Thao tác"].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr><td colSpan="8" className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                      ) : filteredData.length === 0 ? (
                        <tr><td colSpan="8" className="py-10 text-center text-gray-500">Không có yêu cầu nào.</td></tr>
                      ) : filteredData.map(req => (
                        <tr
                          key={req.reportId}
                          className="hover:bg-green-50 transition-colors cursor-pointer"
                          onClick={() => setViewItem(req)}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm shrink-0 bg-blue-100 text-blue-600">
                                {req.citizen?.fullName?.charAt(0) || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{req.citizen?.fullName}</p>
                                <p className="text-xs text-gray-400">#REQ-{req.reportId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                              <Tag className="w-3 h-3" />
                              {req.wasteType}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-[160px]">
                            <p className="text-sm text-gray-700 truncate">{req.description || "—"}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium whitespace-nowrap">
                              {req.area?.areaName || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="text-sm text-gray-600">{new Date(req.createdAt).toLocaleString("vi-VN")}</p>
                          </td>
                          <td className="py-3 px-3">
                            {req.teamId ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                  T
                                </div>
                                <span className="text-sm text-gray-700 whitespace-nowrap">Team {req.teamId}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Chưa phân công</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[req.status] || "bg-gray-100 text-gray-700"}`}>
                              {statusLabels[req.status] || req.status}
                            </span>
                          </td>
                          <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEdit(req)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteTarget(req.reportId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredData.length}</span> trong số <span className="font-medium">{filteredData.length}</span> kết quả
                  </p>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="w-9 h-9 rounded-lg text-sm font-medium bg-green-500 text-white">1</button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ViewModal
        item={viewItem}
        statusColors={statusColors}
        statusLabels={statusLabels}
        onClose={() => setViewItem(null)}
        onEdit={openEdit}
      />
      <EditModal
        form={editForm}
        setForm={setEditForm}
        statusColors={statusColors}
        statusLabels={statusLabels}
        onSave={saveEdit}
        onClose={() => { setEditId(null); setEditForm(null); }}
      />
      <DeleteModal
        target={deleteTarget}
        data={data}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ReportManagement;
