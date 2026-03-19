import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ROLES } from "./contexts/AuthContext";
import Header from "./components/Layouts/Header.jsx";
import Homepage from "./components/Page/Homepage.jsx";
import Footer from "./components/Layouts/Footer.jsx";
import Register from "./components/Register/Register.jsx";
import Login from "./components/Login/Login.jsx";
import ReportWaste from "./components/Page/ReportWaste.jsx";
import AdminPage from "./components/Page/AdminPage.jsx";
import ProtectedRoute from "./components/Routes/ProtectedRoute.jsx";
import ReportManagement from "./components/Page/ReportManagement.jsx";
import UserManagement from "./components/Page/UserManagement.jsx";
import CollectorManagement from "./components/Page/CollectorManagement.jsx";
import AreaManagement from "./components/Page/AreaManagement.jsx";
import CollectorDashboard from "./components/Collector/CollectorDashboard.jsx";
import CollectorTasks from "./components/Collector/CollectorTasks.jsx";
import CollectorSchedule from "./components/Collector/CollectorSchedule.jsx";
import ManagerDashboard from "./components/Manager/ManagerDashboard.jsx";
import ManagerCollector from "./components/Manager/ManagerCollector.jsx";
import ManagerSchedule from "./components/Manager/ManagerSchedule.jsx";
import Rewards from "./components/Page/Rewards.jsx";
import Rankings from "./components/Page/Rankings.jsx";
import Profile from "./components/Page/Profile.jsx";
import VerifyEmail from "./components/Auth/VerifyEmail.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Collector portal (no Header/Footer, own sidebar) ── */}
          <Route
            path="/collector"
            element={
              <ProtectedRoute allowedRoles={[ROLES.COLLECTOR, ROLES.ADMIN]}>
                <CollectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collector/tasks"
            element={
              <ProtectedRoute allowedRoles={[ROLES.COLLECTOR, ROLES.ADMIN]}>
                <CollectorTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collector/schedule"
            element={
              <ProtectedRoute allowedRoles={[ROLES.COLLECTOR, ROLES.ADMIN]}>
                <CollectorSchedule />
              </ProtectedRoute>
            }
          />

          {/* ── Area Manager portal (no Header/Footer, own sidebar) ── */}
          <Route
            path="/manager"
            element={
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

          {/* ── Public / Admin routes (with Header + Footer) ── */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50">
                <Header />
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                   <Route
                    path="/report-waste"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                        <ReportWaste />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rewards"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                        <Rewards />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rankings"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                        <Rankings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.ADMIN, ROLES.COLLECTOR, ROLES.AREA_MANAGER]}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/reportManagement" element={<ReportManagement />} />
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
                    path="/areaManagement"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AreaManagement />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Footer />
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
