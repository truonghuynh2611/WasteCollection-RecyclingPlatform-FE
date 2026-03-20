// Nhập các hook từ React
import { useState } from "react";
// Nhập các icon minh họa từ thư viện lucide-react
import { Search, Filter, Mail, Phone, MoreVertical, X, Settings2, Trash2 } from "lucide-react";
// Nhập Sidebar dành riêng cho Manager
import ManagerSidebar from "./ManagerSidebar";

/**
 * DANH SÁCH GIẢ LẬP (MOCK DATA) CÁC NGƯỜI THU GOM
 */
const initialCollectors = [
  { id: 1, name: "Nguyễn Văn An",   code: "NV-001", role: "Trưởng nhóm",    status: "Đang làm viêc", phone: "0901234567", email: "an.nv@greenvn.com",   rating: 4.8, tasks: 124 },
  { id: 2, name: "Trần Thị Bích",   code: "NV-002", role: "Nhân viên",      status: "Đang làm viêc", phone: "0902345678", email: "bich.tt@greenvn.com", rating: 4.5, tasks: 98 },
  { id: 3, name: "Lê Văn Cường",    code: "NV-003", role: "Nhân viên",      status: "Nghỉ phép",     phone: "0903456789", email: "cuong.lv@greenvn.com",rating: 4.9, tasks: 156 },
  { id: 4, name: "Phạm Minh Dũng",  code: "NV-004", role: "Tài xế xe",      status: "Đang làm viêc", phone: "0904567890", email: "dung.pm@greenvn.com", rating: 4.2, tasks: 85 },
];

export default function ManagerCollector() {
  // States quản lý danh sách, từ khóa tìm kiếm và bộ lọc trạng thái
  const [collectors, setCollectors] = useState(initialCollectors);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  /**
   * HÀM LỌC DANH SÁCH THEO TÊN/MÃ VÀ TRẠNG THÁI
   */
  const filtered = collectors.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR BÊN TRÁI */}
      <ManagerSidebar />

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* THANH TIÊU ĐỀ (Header) */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-bold text-gray-800">Quản lý người thu gom khu vực</h1>
          <p className="text-sm text-gray-500 mt-0.5">Danh sách các người thu gom trong khu vực 1A</p>
        </header>

        {/* VÙNG CHỨA CÔNG CỤ TÌM KIẾM VÀ DANH SÁCH */}
        <main className="flex-1 p-8">
          
          {/* THANH CÔNG CỤ (TÌM KIẾM + LỌC + THÊM MỚI) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Ô nhập tìm kiếm */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc mã..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Lọc theo trạng thái */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang làm viêc">Đang làm việc</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
              </select>
            </div>
            {/* Nút thêm mới */}
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
              + Thêm người thu gom
            </button>
          </div>

          {/* HIỂN THỊ DANH SÁCH DẠNG CARD (Lưới) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                
                {/* Phần thông tin cơ bản (Avatar + Tên) */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 leading-tight">{s.name}</h3>
                      <p className="text-xs text-gray-500">{s.code} • {s.role}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Nhãn trạng thái */}
                <div className="mb-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    s.status === "Đang làm viêc" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {s.status}
                  </span>
                </div>

                {/* Thông tin liên hệ */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {s.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{s.email}</span>
                  </div>
                </div>

                {/* Thống kê hiệu suất (Đánh giá & Nhiệm vụ) */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Đánh giá</p>
                    <p className="font-bold text-gray-800">⭐ {s.rating}</p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Nhiệm vụ</p>
                    <p className="font-bold text-gray-800">{s.tasks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
