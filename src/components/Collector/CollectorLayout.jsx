// Nhập các component cần thiết cho Layout
import CollectorHeader from "./CollectorHeader";
import CollectorSidebar from "./CollectorSidebar";
// Nhập Outlet từ react-router-dom để render các route con
import { Outlet } from "react-router-dom";

/**
 * COMPONENT LAYOUT TỔNG THỂ CHO COLLECTOR
 * Bao gồm Header ở trên cùng và Sidebar bên trái, nội dung trang ở giữa
 */
export default function CollectorLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER CỐ ĐỊNH Ở TRÊN CÙNG (Full width) */}
      <CollectorHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
        <CollectorSidebar />
        
        {/* VÙNG CHỨA NỘI DUNG CHÍNH (Sẽ cuộn độc lập nếu cần) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
