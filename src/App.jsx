import "./App.css";
import Header from "./components/Layouts/Header.jsx";
import Homepage from "./components/HomePage/Homepage.jsx";
import Footer from "./components/Layouts/Footer.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Homepage />
      <Footer />
    </div>
  );
}

export default App;
