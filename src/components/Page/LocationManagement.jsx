import { useState, useEffect } from "react";
import { 
  MapPin, Plus, Search, Edit2, Trash2, X, ChevronRight, 
  Layers, Users, UserPlus, Eye, Building2, ArrowLeft,
  LayoutGrid, Info, ShieldCheck, Activity, Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Layouts/Sidebar";
import { getAllDistricts, createDistrict, updateDistrict, deleteDistrict } from "../../api/district";
import { getAllAreas, createArea, updateArea, deleteArea } from "../../api/area";
import { toast } from "react-hot-toast";

// --- Compact Sub-components ---

const MiniStat = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 overflow-hidden">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{label}</p>
      <p className="text-lg font-black text-gray-800 leading-none">{value}</p>
    </div>
  </div>
);

export default function LocationManagement() {
  // --- State ---
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form data
  const [districtForm, setDistrictForm] = useState({ name: "", areasToAdd: [""] });
  const [areaForm, setAreaForm] = useState({ name: "", description: "" });

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [distRes, areaRes] = await Promise.all([
        getAllDistricts(),
        getAllAreas()
      ]);
      if (distRes.success) setDistricts(distRes.data);
      if (areaRes) setAreas(areaRes);
    } catch (error) {
      toast.error("Không thể tải dữ liệu địa điểm");
    } finally {
      setLoading(false);
    }
  };

  // --- District CRUD ---
  const handleOpenDistrictModal = (district = null) => {
    setEditingItem(district);
    setDistrictForm({ 
      name: district ? district.districtName : "",
      areasToAdd: [""] // Reset areas to add
    });
    setShowDistrictModal(true);
  };

  const handleDistrictSubmit = async (e) => {
    e.preventDefault();
    if (!districtForm.name.trim()) return toast.error("Vui lòng nhập tên quận");

    try {
      if (editingItem) {
        await updateDistrict(editingItem.districtId, { districtName: districtForm.name });
        toast.success("Cập nhật quận thành công");
      } else {
        // Bulk creation support
        const payload = {
          districtName: districtForm.name,
          initialAreaNames: districtForm.areasToAdd.filter(a => a.trim() !== "")
        };
        await createDistrict(payload);
        toast.success("Thêm quận mới thành công");
      }
      setShowDistrictModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi xử lý thông tin quận");
    }
  };

  const addAreaField = () => {
    setDistrictForm({ ...districtForm, areasToAdd: [...districtForm.areasToAdd, ""] });
  };

  const removeAreaField = (index) => {
    const list = [...districtForm.areasToAdd];
    list.splice(index, 1);
    setDistrictForm({ ...districtForm, areasToAdd: list });
  };

  // --- Area CRUD (Single) ---
  const handleOpenAreaModal = (area = null) => {
    setEditingItem(area);
    setAreaForm({ name: area ? area.name : "" });
    setShowAreaModal(true);
  };

  const handleAreaSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...areaForm, districtId: selectedDistrict.districtId };
      if (editingItem) {
        await updateArea(editingItem.areaId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await createArea(payload);
        toast.success("Thêm khu vực thành công");
      }
      setShowAreaModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi lưu khu vực");
    }
  };

  // --- Filtering ---
  const filteredDistricts = districts.filter(d => 
    d.districtName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAreas = areas.filter(a => 
    a.districtId === selectedDistrict?.districtId &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- Compact Renders ---

  const renderDistricts = () => (
    <div className="space-y-4">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-gray-800">Cấp Quận / Huyện</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Master View</p>
        </div>
        <button
          onClick={() => handleOpenDistrictModal()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          QUẬN MỚI
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {filteredDistricts.map(district => {
          const areaCount = areas.filter(a => a.districtId === district.districtId).length;
          return (
            <motion.div 
              layoutId={`district-${district.districtId}`}
              key={district.districtId}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex flex-col p-4 relative"
              onClick={() => setSelectedDistrict(district)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <MapPin className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleOpenDistrictModal(district)} className="p-1 text-gray-300 hover:text-indigo-600"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => { if(window.confirm("Xóa?")) deleteDistrict(district.districtId).then(fetchData); }} className="p-1 text-gray-300 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <h3 className="text-sm font-black text-gray-800 group-hover:text-indigo-600 transition-colors truncate">{district.districtName}</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">{areaCount} KHU VỰC</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderAreas = () => (
    <div className="space-y-4 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedDistrict(null)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all text-gray-400 hover:text-indigo-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedDistrict.districtName}</h2>
            <p className="text-sm text-gray-500">Danh sách các khu vực thuộc {selectedDistrict.districtName}</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenAreaModal()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Thêm Khu vực
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Khu Vực</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Đội ngũ (Team)</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Báo cáo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAreas.map(area => {
              const mainTeam = area.teams?.find(t => t.type === 'Main' || t.type === 0);
              const supportTeam = area.teams?.find(t => t.type === 'Support' || t.type === 1);
              return (
                <tr key={area.areaId} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{area.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${mainTeam ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs font-medium text-gray-700">
                          {mainTeam ? `Đội chính: ${mainTeam.name}` : "Chưa có Đội chính"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${supportTeam ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        <span className="text-xs font-medium text-gray-700">
                          {supportTeam ? `Đội phụ: ${supportTeam.name}` : "Chưa có Đội phụ"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      area.totalReports > 0 ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {area.totalReports || 0} báo cáo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenAreaModal(area)} className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if(window.confirm("Xóa?")) deleteArea(area.areaId).then(fetchData); }} className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-white rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAreas.length === 0 && (
          <div className="py-12 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">Không có dữ liệu khu vực</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="w-full space-y-8">
            
            {/* Standard Header Style */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý khu vực</h1>
                <p className="text-gray-500 mt-1">Quản lý hệ thống Quận/Huyện và các khu vực thu gom trực thuộc</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Tổng số Quận", value: districts.length, icon: Building2, color: "text-indigo-600", bg: "bg-white" },
                { label: "Tổng Khu Vực", value: areas.length, icon: Layers, color: "text-green-600", bg: "bg-green-50/50" },
                { label: "Đội ngũ hoạt động", value: areas.reduce((acc, a) => acc + (a.teamCount || 0), 0), icon: Users, color: "text-amber-600", bg: "bg-amber-50/50" },
                { label: "Báo cáo chờ xử lý", value: areas.reduce((acc, a) => acc + (a.totalReports || 0), 0), icon: Activity, color: "text-rose-600", bg: "bg-rose-50/50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl border border-gray-200 p-6 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 ml-1" />
              <input 
                type="text"
                placeholder={selectedDistrict ? `Tìm kiếm khu vực trong ${selectedDistrict.districtName}...` : "Tìm kiếm Quận / Huyện..."}
                className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-gray-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="h-6 w-px bg-gray-100 mx-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {selectedDistrict ? `${filteredAreas.length} Khu vực` : `${filteredDistricts.length} Quận`}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <div key="loading" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                selectedDistrict ? renderAreas() : renderDistricts()
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* --- REFACTORED DISTRICT MODAL (Bulk Support) --- */}
      {showDistrictModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="px-8 pt-8 pb-6 text-center">
              <h3 className="text-xl font-black text-gray-800 mb-1">
                {editingItem ? "Cập nhật Quận" : "Thêm Quận mới"}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Quản trị hệ thống địa điểm</p>
              
              <form onSubmit={handleDistrictSubmit} className="space-y-4">
                <div className="text-left">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Tên Quận / Huyện</label>
                  <input
                    type="text"
                    required autoFocus
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={districtForm.name}
                    onChange={e => setDistrictForm({ ...districtForm, name: e.target.value })}
                  />
                </div>

                {/* BULK AREA LIST */}
                {!editingItem && (
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Khu vực khởi tạo (Tùy chọn)</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {districtForm.areasToAdd.map((area, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Khu vực ${idx + 1}...`}
                            className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-green-500"
                            value={area}
                            onChange={(e) => {
                              const newList = [...districtForm.areasToAdd];
                              newList[idx] = e.target.value;
                              setDistrictForm({ ...districtForm, areasToAdd: newList });
                            }}
                          />
                          {districtForm.areasToAdd.length > 1 && (
                            <button type="button" onClick={() => removeAreaField(idx)} className="p-2 text-gray-300 hover:text-red-500">
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      onClick={addAreaField}
                      className="mt-3 flex items-center gap-1.5 text-indigo-600 font-black text-[10px] hover:text-indigo-700 uppercase tracking-tighter"
                    >
                      <Plus className="w-3 h-3" /> Thêm ô nhập khu vực
                    </button>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowDistrictModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase transition-all">HỦY</button>
                  <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95">XÁC NHẬN</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Simplified Area Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">{editingItem ? 'Sửa khu vực' : 'Thêm khu vực mới'}</h3>
              <form onSubmit={handleAreaSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên khu vực</label>
                  <input
                    type="text" required autoFocus
                    placeholder="Nhập tên khu vực..."
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:border-green-500 transition-all"
                    value={areaForm.name}
                    onChange={e => setAreaForm({ ...areaForm, name: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAreaModal(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm transition-all">HỦY</button>
                  <button type="submit" className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-100 transition-all active:scale-95">LƯU</button>
                </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
