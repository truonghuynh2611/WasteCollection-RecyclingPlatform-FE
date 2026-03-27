// Nhập file CSS chính cho component App
import "./App.css";
// Nhập các thành phần cần thiết để cấu hình routing từ react-router-dom
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Nhập AuthProvider để quản lý trạng thái đăng nhập và ROLES để phân quyền người dùng
import { AuthProvider, ROLES } from "./contexts/AuthContext";
// Nhập NotificationProvider để quản lý các thông báo trong ứng dụng
import { NotificationProvider } from "./contexts/NotificationContext";
// Nhập các thành phần giao diện chung (Layout)
import Header from "./components/Layouts/Header.jsx";
import Footer from "./components/Layouts/Footer.jsx";
// Nhập các trang (Pages) của ứng dụng
import Homepage from "./components/Page/Homepage.jsx";
import Register from "./components/Register/Register.jsx";
import Login from "./components/Login/Login.jsx";
import ReportWaste from "./components/Page/ReportWaste.jsx";
import AdminPage from "./components/Page/AdminPage.jsx";
import ProtectedRoute from "./components/Routes/ProtectedRoute.jsx";
import ReportManagement from "./components/Page/ReportManagement.jsx";
import UserManagement from "./components/Page/UserManagement.jsx";
import CollectorManagement from "./components/Page/CollectorManagement.jsx";
import LocationManagement from "./components/Page/LocationManagement.jsx";
import TeamManagement from "./components/Page/TeamManagement.jsx";
import VoucherManagement from "./components/Page/VoucherManagement.jsx";
import CollectorLayout from "./components/Collector/CollectorLayout.jsx";
import CollectorDashboard from "./components/Collector/CollectorDashboard.jsx";
import CollectorTasks from "./components/Collector/CollectorTasks.jsx";
import CollectorSchedule from "./components/Collector/CollectorSchedule.jsx";
import CollectorMembers from "./components/Collector/CollectorMembers.jsx";
import LeaderReport from "./components/Collector/LeaderReport.jsx";
import ManagerDashboard from "./components/Manager/ManagerDashboard.jsx";
import ManagerCollector from "./components/Manager/ManagerCollector.jsx";
import ManagerSchedule from "./components/Manager/ManagerSchedule.jsx";
import Rewards from "./components/Page/Rewards.jsx";
import Rankings from "./components/Page/Rankings.jsx";
import Profile from "./components/Page/Profile.jsx";
import VerifyEmail from "./components/Auth/VerifyEmail.jsx";
import PointConfiguration from "./components/Page/PointConfiguration.jsx";
// Nhập Toaster để hiển thị các thông báo dạng toast (nhảy lên ở góc màn hình)
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    // BrowserRouter bao bọc toàn bộ ứng dụng để kích hoạt tính năng điều hướng (routing)
    <BrowserRouter>
      {/* AuthProvider cung cấp thông tin về người dùng đã đăng nhập cho toàn bộ các component con */}
      <AuthProvider>
        {/* NotificationProvider quản lý việc gửi và hiển thị các thông báo nội bộ */}
        <NotificationProvider>
          {/* Toaster dùng để hiển thị các thông báo pop-up nhanh (vd: "Đăng nhập thành công") */}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          {/* Routes chứa danh sách các đường dẫn (Router) của ứng dụng */}
          <Routes>
            {/* ── Khu vực dành cho Nhân viên thu gom (Collector) - Sử dụng Layout chung hỗ trợ Header + Sidebar ── */}
            <Route
              path="/collector"
              element={
                <ProtectedRoute allowedRoles={[ROLES.COLLECTOR, ROLES.ADMIN]}>
                  <CollectorLayout />
                </ProtectedRoute>
              }
            >
              {/* Trang Dashboard mặc định cho Collector */}
              <Route index element={<CollectorDashboard />} />
              {/* Trang quản lý nhiệm vụ */}
              <Route path="tasks" element={<CollectorTasks />} />
              {/* Trang danh sách thành viên trong team */}
              <Route path="members" element={<CollectorMembers />} />
              {/* Trang báo cáo nhiệm vụ - chỉ dành cho Leader */}
              <Route path="report" element={<LeaderReport />} />
              {/* Trang lịch làm việc (Vẫn giữ route nhưng đã ẩn link trên Sidebar) */}
              <Route path="schedule" element={<CollectorSchedule />} />
            </Route>

          {/* ── Khu vực dành cho Quản lý khu vực (Area Manager) - Không có Header/Footer chung, có Sidebar riêng ── */}
          <Route
            path="/manager"
            element={
              // ProtectedRoute kiểm tra quyền AREA_MANAGER hoặc ADMIN
              <ProtectedRoute allowedRoles={[ROLES.AREA_MANAGER, ROLES.ADMIN]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/collector"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AREA_MANAGER, ROLES.ADMIN]}>
                <ManagerCollector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/schedule"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AREA_MANAGER, ROLES.ADMIN]}>
                <ManagerSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/requests"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AREA_MANAGER, ROLES.ADMIN]}>
                <ReportManagement />
              </ProtectedRoute>
            }
          />

          {/* ── Các trang Công khai / Admin (Sử dụng Header + Footer chung) ── */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header xuất hiện trên đầu các trang này */}
                <Header />
                <main className="flex-1 flex flex-col">
                  <Routes>
                  {/* Trang chủ */}
                  <Route path="/" element={<Homepage />} />
                  {/* Trang đăng ký tài khoản */}
                  <Route path="/register" element={<Register />} />
                  {/* Trang đăng nhập */}
                  <Route path="/login" element={<Login />} />
                  {/* Trang xác thực email */}
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  
                  {/* Trang dành cho Quản trị viên (Admin) */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Trang báo cáo rác thải dành cho Người dân (Citizen) */}
                   <Route
                    path="/report-waste"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                        <ReportWaste />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Trang đổi quà tích điểm */}
                  <Route
                    path="/rewards"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                        <Rewards />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Trang xem bảng xếp hạng */}
                  <Route
                    path="/rankings"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                        <Rankings />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Trang thông tin cá nhân (Truy cập được bởi mọi role) */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.ADMIN, ROLES.COLLECTOR, ROLES.AREA_MANAGER]}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Quản lý báo cáo */}
                  <Route path="/reportManagement" element={<ReportManagement />} />
                  
                  {/* Các trang quản lý dành riêng cho Admin */}
                  <Route
                    path="/userManagement"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/collectorManagement"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <CollectorManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/locationManagement"
                    element={
<<<<<<< HEAD
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AreaManagement />
=======
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.AREA_MANAGER]}>
                        <LocationManagement />
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teamManagement"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <TeamManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
<<<<<<< HEAD
                    path="/districtManagement"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <DistrictManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
=======
>>>>>>> 3175e36646d1ecc1f24b806543288dc880fffd24
                    path="/voucherManagement"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <VoucherManagement />
                      </ProtectedRoute>
                    }
                  />

                  
                  {/* Trang cấu hình điểm thưởng (Cho Admin và Quản lý) */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <PointConfiguration />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                </main>
                {/* Footer xuất hiện dưới cùng của các trang này */}
                <Footer />
              </div>
            }
          />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
