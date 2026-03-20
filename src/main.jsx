// Nhập thư viện React để sử dụng các thành phần (JSX)
import React from "react";
// Nhập thư viện ReactDOM để render ứng dụng vào DOM của trình duyệt
import ReactDOM from "react-dom/client";
// Nhập component chính App - nơi chứa toàn bộ logic giao diện của ứng dụng
import App from "./App.jsx";
// Nhập file CSS toàn cục để áp dụng phong cách cho toàn bộ ứng dụng
import "./index.css";

// Tìm phần tử HTML có id là 'root' và khởi tạo gốc của ứng dụng React tại đó
// Sau đó render (hiển thị) component App vào trong root này
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
