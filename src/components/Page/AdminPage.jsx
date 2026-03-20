// Nhập các icon minh họa từ thư viện lucide-react
import { Zap, Users as Users2, Truck, CheckCircle } from "lucide-react";
// Nhập Sidebar chung định nghĩa trong thư mục Layouts
import Sidebar from "../Layouts/Sidebar";

/**
 * COMPONENT TRANG QUẢN TRỊ (ADMIN DASHBOARD)
 * Hiển thị các số liệu thống kê tổng thể và biểu đồ xu hướng
 */
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR BÊN TRÁI */}
      <Sidebar />

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* PHẦN ĐẦU: TIÊU ĐỀ VÀ LỜI CHÀO */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Tổng quan hoạt động
              </h1>
              <p className="text-gray-600">
                Chào mừng trở lại! Hôm nay có 12 yêu cầu thu gom mới.
              </p>
            </div>

            {/* HÀNG CÁC CARD THỐNG KÊ NHANH (STATS) */}
            <div className="grid grid-cols-6 gap-4 mb-8">
              {/* Card: Tổng số yêu cầu hiện có */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Hiện có
                  </span>
                  <Zap className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-800">156</p>
                <p className="text-xs text-gray-500 mt-1">Yêu cầu</p>
              </div>

              {/* Card: Yêu cầu đang chờ phân công */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Chờ phân công
                  </span>
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">!</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">42</p>
                <p className="text-xs text-orange-600 mt-1">Cần xử lý ngay</p>
              </div>

              {/* Card: Yêu cầu đã được phân công */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Đã phân công
                  </span>
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users2 className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">28</p>
                <p className="text-xs text-blue-600 mt-1">Đang chờ người thu gom</p>
              </div>

              {/* Card: Yêu cầu đang trong quá trình thu gom */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Đang thu gom
                  </span>
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <Truck className="w-3 h-3 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">14</p>
                <p className="text-xs text-purple-600 mt-1">Đang di chuyển</p>
              </div>

              {/* Card: Tổng số yêu cầu đã hoàn thành */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Đã hoàn thành
                  </span>
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">1,240</p>
                <p className="text-xs text-green-600 mt-1">Tổng yêu cầu</p>
              </div>
            </div>

            {/* KHU VỰC BIỂU ĐỒ (CHARTS) */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              
              {/* Biểu đồ đường: Xu hướng thu gom theo tuần (Vẽ bằng SVG) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Xu hướng thu gom
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Số lượng báo cáo rác hoàn thành trong 7 ngày qua
                </p>

                <svg viewBox="0 0 800 300" className="w-full h-64 mt-4">
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#10b981", stopOpacity: 0.2 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: "#10b981", stopOpacity: 0 }}
                      />
                    </linearGradient>
                  </defs>

                  <g transform="translate(60, 20)">
                    {/* Vẽ đường line xu hướng */}
                    <polyline
                      points="0,180 80,140 160,120 240,100 320,80 400,120 480,140 560,100 640,80"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    {/* Vẽ vùng màu phía dưới đường line */}
                    <polygon
                      points="0,180 80,140 160,120 240,100 320,80 400,120 480,140 560,100 640,80 640,250 0,250"
                      fill="url(#areaGradient)"
                    />

                    {/* Các điểm nút trên biểu đồ */}
                    <circle cx="0" cy="180" r="4" fill="#10b981" />
                    <circle cx="80" cy="140" r="4" fill="#10b981" />
                    <circle cx="160" cy="120" r="4" fill="#10b981" />
                    <circle cx="240" cy="100" r="4" fill="#10b981" />
                    <circle cx="320" cy="80" r="4" fill="#10b981" />
                    <circle cx="400" cy="120" r="4" fill="#10b981" />
                    <circle cx="480" cy="140" r="4" fill="#10b981" />
                    <circle cx="560" cy="100" r="4" fill="#10b981" />
                    <circle cx="640" cy="80" r="4" fill="#10b981" />

                    {/* Đường trục ngang */}
                    <line
                      x1="0"
                      y1="230"
                      x2="640"
                      y2="230"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />

                    {/* Nhãn các thứ trong tuần */}
                    <text x="0" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">Thứ 2</text>
                    <text x="80" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">Thứ 3</text>
                    <text x="160" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">Thứ 4</text>
                    <text x="240" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">Thứ 5</text>
                    <text x="320" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">Thứ 6</text>
                    <text x="400" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">Thứ 7</text>
                    <text x="480" y="250" fontSize="14" fill="#9ca3af" textAnchor="middle">CN</text>

                    {/* Chỉ số trục dọc */}
                    <text x="-40" y="180" fontSize="12" fill="#9ca3af" textAnchor="end">0</text>
                    <text x="-40" y="100" fontSize="12" fill="#9ca3af" textAnchor="end">25</text>
                    <text x="-40" y="20" fontSize="12" fill="#9ca3af" textAnchor="end">45</text>
                  </g>
                </svg>
              </div>

              {/* Biểu đồ tròn (Donut chart): Phân tích tỷ lệ loại rác */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Phân tích loại rác
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Tỷ lệ theo danh mục
                </p>

                <div className="flex items-center justify-center mb-8">
                  <svg viewBox="0 0 200 200" className="w-32 h-32">
                    {/* Phần Giấy (Màu xanh lá) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="30"
                      strokeDasharray="150.8 502.4"
                      transform="rotate(-90 100 100)"
                    />
                    {/* Phần Kim loại (Màu cam) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="30"
                      strokeDasharray="125.6 502.4"
                      strokeDashoffset="-150.8"
                      transform="rotate(-90 100 100)"
                    />
                    {/* Phần Nhựa (Màu xanh dương) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="30"
                      strokeDasharray="226 502.4"
                      strokeDashoffset="-276.4"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                </div>

                {/* Chú thích biểu đồ tròn */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Giấy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700">Nhựa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-700">Kim loại</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PHẦN HIỆU SUẤT NHÂN VIÊN (BAR CHART) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Hiệu suất nhân viên
                  </h3>
                  <p className="text-sm text-gray-600">
                    Top 5 nhân viên thu gom xuất sắc nhất
                  </p>
                </div>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Xem tất cả
                </button>
              </div>

              <svg viewBox="0 0 900 250" className="w-full h-48">
                <g transform="translate(60, 20)">
                  {/* Các cột biểu đồ đại diện cho từng nhân viên */}
                  <rect x="0" y="60" width="80" height="120" fill="#10b981" rx="4" />
                  <rect x="140" y="100" width="80" height="80" fill="#10b981" rx="4" />
                  <rect x="280" y="130" width="80" height="50" fill="#10b981" rx="4" />
                  <rect x="420" y="145" width="80" height="35" fill="#10b981" rx="4" />
                  <rect x="560" y="160" width="80" height="20" fill="#10b981" rx="4" />

                  <line x1="0" y1="190" x2="640" y2="190" stroke="#e5e7eb" strokeWidth="1" />

                  {/* Tên nhân viên dưới mỗi cột */}
                  <text x="40" y="200" fontSize="14" fill="#9ca3af" textAnchor="middle">Nguyễn Văn A</text>
                  <text x="180" y="200" fontSize="14" fill="#9ca3af" textAnchor="middle">Trần Thị B</text>
                  <text x="320" y="200" fontSize="14" fill="#9ca3af" textAnchor="middle">Lê Văn C</text>
                  <text x="460" y="200" fontSize="14" fill="#9ca3af" textAnchor="middle">Phạm Minh D</text>
                  <text x="600" y="200" fontSize="14" fill="#9ca3af" textAnchor="middle">Hoàng Thị E</text>

                  {/* Số lượng hoàn thành hiển thị trên đầu cột */}
                  <text x="40" y="50" fontSize="14" fill="#374151" textAnchor="middle" fontWeight="bold">120</text>
                  <text x="180" y="90" fontSize="14" fill="#374151" textAnchor="middle" fontWeight="bold">95</text>
                  <text x="320" y="120" fontSize="14" fill="#374151" textAnchor="middle" fontWeight="bold">78</text>
                  <text x="460" y="135" fontSize="14" fill="#374151" textAnchor="middle" fontWeight="bold">68</text>
                  <text x="600" y="150" fontSize="14" fill="#374151" textAnchor="middle" fontWeight="bold">55</text>

                  {/* Chỉ số trục dọc của biểu đồ cột */}
                  <text x="-40" y="190" fontSize="12" fill="#9ca3af" textAnchor="end">0</text>
                  <text x="-40" y="110" fontSize="12" fill="#9ca3af" textAnchor="end">100</text>
                  <text x="-40" y="30" fontSize="12" fill="#9ca3af" textAnchor="end">120</text>
                </g>
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
