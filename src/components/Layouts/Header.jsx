import { Recycle } from "lucide-react";

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Recycle className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold text-gray-900">
              Green Vietnam
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-900 font-medium hover:text-green-500 transition"
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-green-500 transition"
            >
              Đăng nhập
            </a>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition">
              Đăng ký
            </button>
          </nav>

          <button className="md:hidden text-gray-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
