import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Layouts/Header.jsx";
import Homepage from "./components/HomePage/Homepage.jsx";
import Footer from "./components/Layouts/Footer.jsx";
import Register from "./components/Register/Register.jsx";
import Login from "./components/Login/Login.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
