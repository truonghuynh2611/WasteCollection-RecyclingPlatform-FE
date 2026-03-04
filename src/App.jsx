import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ROLES } from "./contexts/AuthContext";
import Header from "./components/Layouts/Header.jsx";
import Homepage from "./components/Page/Homepage.jsx";
import Footer from "./components/Layouts/Footer.jsx";
import Register from "./components/Register/Register.jsx";
import Login from "./components/Login/Login.jsx";
import CitizenPage from "./components/Page/CitizenPage.jsx";
import AdminPage from "./components/Page/AdminPage.jsx";
import ProtectedRoute from "./components/Routes/ProtectedRoute.jsx";
import ReportManagement from "./components/Page/ReportManagement.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                  <CitizenPage />
                </ProtectedRoute>
              }
            />
            <Route path="/reportManagement" element={<ReportManagement />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
