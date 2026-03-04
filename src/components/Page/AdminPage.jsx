import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPage = () => {
  const [stats, setStats] = useState({
    available: 156,
    needsProcessing: 42,
    assigned: 28,
    inProgress: 14,
    completed: 1240,
    completedGrowth: '+12%'
  });

  // Dữ liệu xu hướng thu gom (7 ngày)
  const trendData = [
    { day: 'Thứ 2', value: 15 },
    { day: 'Thứ 3', value: 24 },
    { day: 'Thứ 4', value: 18 },
    { day: 'Thứ 5', value: 32 },
    { day: 'Thứ 6', value: 29 },
    { day: 'Thứ 7', value: 41 },
    { day: 'CN', value: 38 }
  ];

  // Dữ liệu phân tích loại rác
  const wasteTypeData = [
    { name: 'Giấy', value: 35, color: '#10B981' },
    { name: 'Nhựa', value: 30, color: '#3B82F6' },
    { name: 'Kim loại', value: 25, color: '#F97316' },
    { name: 'Khác', value: 10, color: '#E5E7EB' }
  ];

  // Dữ liệu hiệu suất nhân viên
  const employeeData = [
    { name: 'Nguyễn Văn A', collections: 120 },
    { name: 'Trần Thị B', collections: 95 },
    { name: 'Lê Văn C', collections: 87 },
    { name: 'Phạm Minh D', collections: 73 },
    { name: 'Hoàng Thị E', collections: 61 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🌱</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">EcoConnect</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">Quản trị viên</div>
              </div>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen border-r">
          <nav className="p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Chính</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-emerald-600 bg-emerald-50 rounded-lg font-medium">
                  <span>📊</span>
                  <span>Bảng điều khiển</span>
                </button>
                <Link 
                  to="/reportManagement" 
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <span>📝</span>
                  <span>Yêu cầu thu gom</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <span>👥</span>
                  <span>Quản lý Collector</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Hoạt động</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <span>⚙️</span>
                  <span>Cấu hình điểm thưởng</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tổng quan hoạt động</h1>
            <p className="text-gray-600 mt-1">Chào mừng trở lại! Hôm nay có {stats.needsProcessing} yêu cầu thu gom mới.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">HIỆN CÓ</span>
                <span className="text-gray-400">📋</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.available}</div>
              <div className="text-sm text-gray-500 mt-1">Yêu cầu</div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">CHỜ PHÂN CÔNG</span>
                <span className="text-orange-500">⏱️</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.needsProcessing}</div>
              <div className="text-sm text-orange-600 mt-1">Cần xử lý ngay</div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">ĐÃ PHÂN CÔNG</span>
                <span className="text-blue-500">👤</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.assigned}</div>
              <div className="text-sm text-gray-500 mt-1">Đang chờ nhận</div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">ĐANG THU GOM</span>
                <span className="text-purple-500">🚚</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-sm text-purple-600 mt-1">Đang đi chuyển</div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">ĐÃ HOÀN THÀNH</span>
                <span className="text-emerald-500">✅</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.completed.toLocaleString()}</div>
              <div className="text-sm text-emerald-600 mt-1">{stats.completedGrowth} tuần này</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Trend Chart */}
            <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Xu hướng thu gom</h2>
                <p className="text-sm text-gray-600">Số lượng báo cáo hoàn thành trong 7 ngày qua</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="#d1fae5" fillOpacity={0.3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Phân tích loại rác</h2>
                <p className="text-sm text-gray-600">Tỷ lệ theo danh mục</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={wasteTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {wasteTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {wasteTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Hiệu suất nhân viên</h2>
                <p className="text-sm text-gray-600">Top 5 nhân viên thu gom xuất sắc nhất</p>
              </div>
              <button className="text-emerald-600 text-sm font-medium hover:underline">
                Xem tất cả
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="collections" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
