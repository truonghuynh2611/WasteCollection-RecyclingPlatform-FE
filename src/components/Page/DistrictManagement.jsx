import { useState, useEffect } from "react";
import { 
  Building2, Plus, Search, Edit2, Trash2, X, MapPin 
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { getAllDistricts, createDistrict, updateDistrict, deleteDistrict } from "../../api/district";
import { toast } from "react-hot-toast";

export default function DistrictManagement() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [districtName, setDistrictName] = useState("");

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const res = await getAllDistricts();
      if (res.success) {
        setDistricts(res.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách quận");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (district = null) => {
    setEditingDistrict(district);
    setDistrictName(district ? district.districtName : "");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!districtName.trim()) return toast.error("Vui lòng nhập tên quận");

    try {
      if (editingDistrict) {
        await updateDistrict(editingDistrict.districtId, { districtName });
        toast.success("Cập nhật thành công");
      } else {
        await createDistrict({ districtName });
        toast.success("Thêm quận mới thành công");
      }
      setShowModal(false);
      fetchDistricts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa quận này?")) return;
    try {
      await deleteDistrict(id);
      toast.success("Xóa thành công");
      fetchDistricts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa quận này");
    }
  };

  const filtered = districts.filter(d => 
    d.districtName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Quận</h1>
                <p className="text-gray-500 mt-1">Quản lý danh mục các quận/huyện trong hệ thống</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm Quận mới
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm quận..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} quận</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))
              ) : filtered.map(district => (
                <div key={district.districtId} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <MapPin className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{district.districtName}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Mã: #{district.districtId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenModal(district)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(district.districtId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy quận nào</h3>
                <p className="text-gray-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm quận mới.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingDistrict ? "Cập nhật Quận" : "Thêm Quận mới"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Quận / Huyện</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="VD: Quận 1, Quận Bình Thạnh..."
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    value={districtName}
                    onChange={e => setDistrictName(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-gray-400 italic font-medium">* Tên quận nên duy nhất để tránh nhầm lẫn</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)} 
                    className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    {editingDistrict ? "Lưu thay đổi" : "Tạo Quận"}
                  </button>
                </div>
              </form>
            </div>
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>
      )}
    </div>
  );
}
